-- Run this file against the tbls_iot database before starting AirClipServer.
-- Existing device tables are extended idempotently; no existing rows are dropped.

CREATE TABLE IF NOT EXISTS users (
  id CHAR(24) PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  password TEXT,
  name TEXT,
  profile_picture TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS password_reset_otps (
  email TEXT PRIMARY KEY,
  otp INTEGER NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS password_reset_otps_expires_at_idx
  ON password_reset_otps (expires_at);

CREATE TABLE IF NOT EXISTS email_verification_otps (
  email TEXT PRIMARY KEY,
  otp INTEGER NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS email_verification_otps_expires_at_idx
  ON email_verification_otps (expires_at);

CREATE TABLE IF NOT EXISTS pwd_verifications (
  email TEXT PRIMARY KEY,
  sub TEXT,
  name TEXT,
  picture TEXT,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS pwd_verifications_expires_at_idx
  ON pwd_verifications (expires_at);

CREATE TABLE IF NOT EXISTS clipboard_items (
  id CHAR(24) PRIMARY KEY,
  content TEXT NOT NULL,
  room TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  sender_username TEXT NOT NULL,
  sender_device_info TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS clipboard_items_room_created_at_idx
  ON clipboard_items (room, created_at DESC);

CREATE TABLE IF NOT EXISTS devices (
  id BIGSERIAL PRIMARY KEY,
  device_id VARCHAR(9) NOT NULL UNIQUE,
  name VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'offline',
  last_seen TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT device_id_format CHECK (device_id ~ '^TBLS[0-9]{5}$')
);

ALTER TABLE devices ADD COLUMN IF NOT EXISTS led_state VARCHAR(16) NOT NULL DEFAULT 'unknown';
ALTER TABLE devices ADD COLUMN IF NOT EXISTS state_source VARCHAR(16) NOT NULL DEFAULT 'unknown';
ALTER TABLE devices ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS commands (
  command_id UUID PRIMARY KEY,
  device_id VARCHAR(9) NOT NULL REFERENCES devices(device_id) ON DELETE CASCADE,
  command VARCHAR(16) NOT NULL CHECK (command IN ('LED_ON', 'LED_OFF')),
  status VARCHAR(16) NOT NULL CHECK (status IN ('pending', 'sent', 'simulated', 'succeeded', 'failed')),
  requested_by VARCHAR(24),
  result JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS commands_device_created_at_idx
  ON commands (device_id, created_at DESC);

CREATE TABLE IF NOT EXISTS device_events (
  id BIGSERIAL PRIMARY KEY,
  device_id VARCHAR(9) NOT NULL REFERENCES devices(device_id) ON DELETE CASCADE,
  event_type VARCHAR(64) NOT NULL,
  severity VARCHAR(16) NOT NULL DEFAULT 'info' CHECK (severity IN ('debug', 'info', 'warning', 'error')),
  message TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS device_events_device_created_at_idx
  ON device_events (device_id, created_at DESC);

INSERT INTO devices (device_id, name, status)
VALUES ('TBLS00001', 'TBLS LED Test Device', 'offline')
ON CONFLICT (device_id) DO NOTHING;

-- Expired OTP rows are filtered at read time. Periodic cleanup is safe:
-- DELETE FROM password_reset_otps WHERE expires_at <= NOW();
-- DELETE FROM email_verification_otps WHERE expires_at <= NOW();
-- DELETE FROM pwd_verifications WHERE expires_at <= NOW();

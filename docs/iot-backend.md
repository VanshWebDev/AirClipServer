# IoT backend development

This branch adds a PostgreSQL-backed IoT API to AirClipServer. The physical Pico is not required for API/UI development: use IOT_MODE=simulator until the hardware is available.

## 1. Prepare PostgreSQL

Create a database named tbls_iot in PostgreSQL, then run migrations/001_initial_postgres_schema.sql against that database using pgAdmin's Query Tool or psql.

The migration creates the AirClip user, OTP and clipboard tables plus the IoT devices, commands and device_events tables. It also inserts TBLS00001 if it does not exist. It does not delete existing rows.

## 2. Configure the server

Copy .env.example to .env in the server repository and set your real local values. Do not commit .env.

For a local PostgreSQL instance, set PGHOST, PGPORT, PGDATABASE=tbls_iot, PGUSER, and PGPASSWORD. DATABASE_URL is an alternative. Keep PGSSL=false only for local development; configure TLS appropriately for a remote database.

Set the existing authentication secrets (COOKIE_SECRET, JWT_SECRET, and CRYPTO_SECRET) to strong values and configure Google OAuth as needed. Configure email using SMTP_USER, SMTP_PASSWORD, and SMTP_FROM; never hard-code the mail app password in source code.

## 3. Install dependencies and migrate existing MongoDB data

Run npm install in this branch so npm resolves the new pg, mqtt and migration-script dependencies and refreshes package-lock.json.

If you need existing AirClip users and clipboard history, set MONGODB_URL temporarily in the local .env, ensure the PostgreSQL schema has been applied, then run:

~~~bash
npm run migrate:mongo
~~~

The import script copies users, clipboard history, unexpired password-reset OTPs, unexpired email-verification OTPs, and pending verification records. It is insert-only for users and clipboard records, and is safe to re-run for those records. Review the displayed counts before switching traffic. Keep a backup of MongoDB until the migration is verified. Remove MONGODB_URL after the migration.

If you do not need existing AirClip data, skip the import. New accounts and records will be created in PostgreSQL after the server starts.

## 4. Run the API in simulator mode

Use:

~~~bash
npm run dev
~~~

The API defaults to simulator mode unless IOT_MODE=mqtt is explicitly configured.

The IoT REST routes require the same signed login cookie as AirClip:

- GET /api/iot/devices
- GET /api/iot/devices/TBLS00001/commands?limit=50
- GET /api/iot/devices/TBLS00001/events?limit=100
- POST /api/iot/devices/TBLS00001/commands

POST body:

~~~json
{"command":"LED_ON"}
~~~

or

~~~json
{"command":"LED_OFF"}
~~~

The simulator returns HTTP 202 with a pending command, then emits iot:command.updated, iot:event.created, and iot:device.updated to the Socket.IO room iot:TBLS00001. Its final command state is simulated, not succeeded; the event/result explicitly says no physical device was contacted. The dashboard should subscribe after connecting:

~~~ts
socket.emit("iot:subscribe", "TBLS00001");
socket.on("iot:command.created", handler);
socket.on("iot:command.updated", handler);
socket.on("iot:event.created", handler);
socket.on("iot:device.updated", handler);
~~~

## 5. Configure real MQTT mode later

Only when ready to publish through the broker, configure:

- IOT_MODE=mqtt
- MQTT_URL=mqtts://your-broker-host:8883
- MQTT_USERNAME and MQTT_PASSWORD for the backend ACL identity
- MQTT_CA_CERT_PATH pointing to the CA certificate file trusted for that broker

TLS peer verification remains enabled; do not disable certificate verification to bypass certificate errors. In MQTT mode the API publishes to tb/TBLS00001/led/command and records sent. It deliberately does not report success until real device acknowledgements are implemented in the later Pico step.

## Status semantics

- pending: backend recorded a command and is processing it.
- sent: MQTT publish was accepted by the client library; this is not proof the Pico executed it.
- simulated: a mock result was produced without physical hardware.
- succeeded: reserved for a future confirmed device acknowledgement.
- failed: command publishing failed or the backend recorded an error.

Keep these distinct in the dashboard. A successful MQTT publish is not a physical-device acknowledgement.

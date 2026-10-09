import { randomUUID } from "node:crypto";
import type { Server } from "socket.io";
import { dbQuery } from "../config/db.js";
import { getIotMode, publishLedCommand } from "./iotMqtt.service.js";
import { emitToDeviceRoom } from "./realtime.service.js";

export type LedCommand = "LED_ON" | "LED_OFF";

interface DeviceRow {
  device_id: string;
  name: string | null;
  status: string;
  last_seen: Date | null;
  led_state: string;
  state_source: string;
  created_at: Date;
  updated_at: Date;
}

interface CommandRow {
  command_id: string;
  device_id: string;
  command: LedCommand;
  status: string;
  requested_by: string | null;
  result: unknown;
  error_message: string | null;
  created_at: Date;
  sent_at: Date | null;
  completed_at: Date | null;
}

interface EventRow {
  id: number;
  device_id: string;
  event_type: string;
  severity: string;
  message: string;
  payload: unknown;
  created_at: Date;
}

const deviceIdPattern = /^TBLS[0-9]{5}$/;

export const isValidDeviceId = (value: string): boolean => deviceIdPattern.test(value);

const mapDevice = (row: DeviceRow) => ({
  deviceId: row.device_id,
  name: row.name,
  status: row.status,
  lastSeen: row.last_seen,
  ledState: row.led_state,
  stateSource: row.state_source,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapCommand = (row: CommandRow) => ({
  commandId: row.command_id,
  deviceId: row.device_id,
  command: row.command,
  status: row.status,
  requestedBy: row.requested_by,
  result: row.result,
  errorMessage: row.error_message,
  createdAt: row.created_at,
  sentAt: row.sent_at,
  completedAt: row.completed_at,
});

const mapEvent = (row: EventRow) => ({
  id: row.id,
  deviceId: row.device_id,
  eventType: row.event_type,
  severity: row.severity,
  message: row.message,
  payload: row.payload,
  createdAt: row.created_at,
});

const appendEvent = async (
  deviceId: string,
  eventType: string,
  message: string,
  payload: unknown,
  severity = "info",
) => {
  const result = await dbQuery(
    "INSERT INTO device_events (device_id, event_type, severity, message, payload) " +
      "VALUES ($1, $2, $3, $4, $5::jsonb) " +
      "RETURNING id, device_id, event_type, severity, message, payload, created_at",
    [deviceId, eventType, severity, message, JSON.stringify(payload ?? {})],
  );
  return mapEvent(result.rows[0] as EventRow);
};

export const listDevices = async () => {
  const result = await dbQuery(
    "SELECT device_id, name, status, last_seen, led_state, state_source, created_at, updated_at " +
      "FROM devices ORDER BY device_id",
  );
  return (result.rows as DeviceRow[]).map(mapDevice);
};

export const listCommands = async (deviceId: string, limit = 50) => {
  const result = await dbQuery(
    "SELECT command_id, device_id, command, status, requested_by, result, error_message, created_at, sent_at, completed_at " +
      "FROM commands WHERE device_id = $1 ORDER BY created_at DESC LIMIT $2",
    [deviceId, limit],
  );
  return (result.rows as CommandRow[]).map(mapCommand);
};

export const listDeviceEvents = async (deviceId: string, limit = 100) => {
  const result = await dbQuery(
    "SELECT id, device_id, event_type, severity, message, payload, created_at " +
      "FROM device_events WHERE device_id = $1 ORDER BY created_at DESC LIMIT $2",
    [deviceId, limit],
  );
  return (result.rows as EventRow[]).map(mapEvent);
};

export const createLedCommand = async (
  deviceId: string,
  command: LedCommand,
  requestedBy: string | null,
  io: Server,
) => {
  if (!isValidDeviceId(deviceId)) {
    const error = new Error("Invalid device ID. Expected TBLS followed by five digits.");
    (error as Error & { status?: number }).status = 400;
    throw error;
  }

  const deviceResult = await dbQuery(
    "SELECT device_id FROM devices WHERE device_id = $1 LIMIT 1",
    [deviceId],
  );
  if (!deviceResult.rows[0]) {
    const error = new Error("Device not found");
    (error as Error & { status?: number }).status = 404;
    throw error;
  }

  const commandId = randomUUID();
  const inserted = await dbQuery(
    "INSERT INTO commands (command_id, device_id, command, status, requested_by) " +
      "VALUES ($1, $2, $3, 'pending', $4) " +
      "RETURNING command_id, device_id, command, status, requested_by, result, error_message, created_at, sent_at, completed_at",
    [commandId, deviceId, command, requestedBy],
  );

  let row = mapCommand(inserted.rows[0] as CommandRow);
  const createdEvent = await appendEvent(
    deviceId,
    "command_requested",
    "Dashboard requested " + command,
    { commandId, command, mode: getIotMode() },
  );

  io.to("iot:" + deviceId).emit("iot:command.created", row);
  io.to("iot:" + deviceId).emit("iot:event.created", createdEvent);

  if (getIotMode() === "mqtt") {
    try {
      await publishLedCommand(deviceId, command);
      const sent = await dbQuery(
        "UPDATE commands SET status = 'sent', sent_at = NOW() " +
          "WHERE command_id = $1 " +
          "RETURNING command_id, device_id, command, status, requested_by, result, error_message, created_at, sent_at, completed_at",
        [commandId],
      );
      row = mapCommand(sent.rows[0] as CommandRow);
      const event = await appendEvent(
        deviceId,
        "command_published",
        "Command published to MQTT; hardware execution has not been acknowledged",
        { commandId, command, topic: "tb/" + deviceId + "/led/command" },
      );
      io.to("iot:" + deviceId).emit("iot:command.updated", row);
      io.to("iot:" + deviceId).emit("iot:event.created", event);
      return { ...row, mode: "mqtt", simulated: false };
    } catch (error) {
      const message = error instanceof Error ? error.message : "MQTT publish failed";
      const failed = await dbQuery(
        "UPDATE commands SET status = 'failed', error_message = $2, completed_at = NOW() " +
          "WHERE command_id = $1 " +
          "RETURNING command_id, device_id, command, status, requested_by, result, error_message, created_at, sent_at, completed_at",
        [commandId, message],
      );
      row = mapCommand(failed.rows[0] as CommandRow);
      const event = await appendEvent(deviceId, "command_publish_failed", message, { commandId, command }, "error");
      io.to("iot:" + deviceId).emit("iot:command.updated", row);
      io.to("iot:" + deviceId).emit("iot:event.created", event);
      const publishError = new Error("MQTT command publish failed: " + message);
      (publishError as Error & { status?: number }).status = 503;
      throw publishError;
    }
  }

  // Simulator results are explicitly marked; they are not a real device ACK.
  setTimeout(() => {
    void (async () => {
      const simulatedResult = {
        simulated: true,
        ledState: command === "LED_ON" ? "on" : "off",
        note: "No physical Pico response was received; this is a simulator result.",
      };
      const completed = await dbQuery(
        "UPDATE commands SET status = 'simulated', result = $2::jsonb, completed_at = NOW() " +
          "WHERE command_id = $1 " +
          "RETURNING command_id, device_id, command, status, requested_by, result, error_message, created_at, sent_at, completed_at",
        [commandId, JSON.stringify(simulatedResult)],
      );
      row = mapCommand(completed.rows[0] as CommandRow);

      await dbQuery(
        "UPDATE devices SET led_state = $2, state_source = 'simulated', updated_at = NOW() WHERE device_id = $1",
        [deviceId, simulatedResult.ledState],
      );

      const event = await appendEvent(
        deviceId,
        "simulated_command_completed",
        "Simulated " + command + "; no physical device was connected",
        { commandId, command, ...simulatedResult },
      );
      io.to("iot:" + deviceId).emit("iot:command.updated", row);
      io.to("iot:" + deviceId).emit("iot:event.created", event);
      io.to("iot:" + deviceId).emit("iot:device.updated", {
        deviceId,
        ledState: simulatedResult.ledState,
        stateSource: "simulated",
        status: "offline",
      });
    })().catch((error: unknown) => {
      console.error("IoT simulator failed:", error);
    });
  }, 500);

  return { ...row, mode: "simulator", simulated: true };
};

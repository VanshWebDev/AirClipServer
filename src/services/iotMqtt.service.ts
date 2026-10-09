import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { connect, type MqttClient } from "mqtt";
import type { Server } from "socket.io";

let mqttClient: MqttClient | null = null;

export const getIotMode = (): "simulator" | "mqtt" =>
  process.env.IOT_MODE === "mqtt" ? "mqtt" : "simulator";

export const initializeIotMqtt = (io: Server): void => {
  if (getIotMode() === "simulator") {
    console.log("IoT simulator mode enabled; MQTT connection is disabled");
    return;
  }

  const url = process.env.MQTT_URL;
  const username = process.env.MQTT_USERNAME;
  const password = process.env.MQTT_PASSWORD;
  const caPath = process.env.MQTT_CA_CERT_PATH;

  if (!url || !username || !password || !caPath) {
    throw new Error(
      "IOT_MODE=mqtt requires MQTT_URL, MQTT_USERNAME, MQTT_PASSWORD and MQTT_CA_CERT_PATH",
    );
  }

  mqttClient = connect(url, {
    clientId: "tbls-backend-" + randomUUID(),
    username,
    password,
    ca: readFileSync(caPath),
    rejectUnauthorized: true,
    protocolVersion: 4,
    clean: true,
    keepalive: 60,
    reconnectPeriod: 5_000,
    connectTimeout: 10_000,
  });

  mqttClient.on("connect", () => {
    console.log("Connected to MQTT broker over TLS");
    io.emit("iot:broker.status", { connected: true, mode: "mqtt" });
  });

  mqttClient.on("reconnect", () => {
    io.emit("iot:broker.status", { connected: false, mode: "mqtt", reconnecting: true });
  });

  mqttClient.on("close", () => {
    io.emit("iot:broker.status", { connected: false, mode: "mqtt" });
  });

  mqttClient.on("error", (error) => {
    console.error("MQTT client error:", error.message);
  });
};

export const publishLedCommand = (
  deviceId: string,
  command: "LED_ON" | "LED_OFF",
): Promise<void> => new Promise((resolve, reject) => {
  if (!mqttClient || !mqttClient.connected) {
    reject(new Error("MQTT broker is not connected"));
    return;
  }

  const topic = "tb/" + deviceId + "/led/command";
  // Keep this payload compatible with the current Pico parser. Add command_id
  // only after the Pico's robust JSON parser and command ACK handling are added.
  const payload = JSON.stringify({ command });

  mqttClient.publish(topic, payload, { qos: 1, retain: false }, (error) => {
    if (error) reject(error);
    else resolve();
  });
});

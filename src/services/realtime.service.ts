import type { Server } from "socket.io";

let socketServer: Server | null = null;

export const setRealtimeServer = (server: Server) => {
  socketServer = server;
};

export const emitToDeviceRoom = (deviceId: string, event: string, payload: unknown) => {
  socketServer?.to("iot:" + deviceId).emit(event, payload);
};

export const emitRealtimeEvent = (event: string, payload: unknown) => {
  socketServer?.emit(event, payload);
};

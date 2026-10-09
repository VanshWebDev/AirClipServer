import express from "express";
import { routeWrapper } from "../utils/error/routeWrapper.js";
import { checkIfAuth } from "../middleware/checkIfAuth.middleware.js";
import {
  getIotCommands,
  getIotDevices,
  getIotEvents,
  postIotCommand,
} from "../controller/iot.controller.js";

const router = express.Router();

router.use(checkIfAuth);
router.get("/devices", routeWrapper(getIotDevices));
router.get("/devices/:deviceId/commands", routeWrapper(getIotCommands));
router.get("/devices/:deviceId/events", routeWrapper(getIotEvents));
router.post("/devices/:deviceId/commands", routeWrapper(postIotCommand));

export default router;

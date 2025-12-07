import express from "express";
import { routeWrapper } from "../utils/error/routeWrapper.js";
import { getClipboardHistory } from "../controller/socket.controller.js";
const router = express.Router();
router.get("/history/:roomName", routeWrapper(getClipboardHistory));
export default router;
//# sourceMappingURL=socket.route.js.map
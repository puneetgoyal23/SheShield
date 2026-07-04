import express from "express";
import { handleTriggerSOS, handleResolveSOS } from "../controllers/sosController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

// Accept optional audio or video file on SOS trigger
router.post("/", upload.single("media"), handleTriggerSOS);
router.patch("/:id/resolve", handleResolveSOS);

export default router;

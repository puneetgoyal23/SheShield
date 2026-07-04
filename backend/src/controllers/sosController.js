import { triggerSOS, resolveSOS } from "../services/sosService.js";
import { successResponse } from "../utils/responseFormatter.js";

export const handleTriggerSOS = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.body;
    const io = req.app.get("io");

    // Detect if uploaded file is audio or video based on mimetype
    let audioUrl = "";
    let videoUrl = "";
    if (req.file) {
      const mime = req.file.mimetype || "";
      const filePath = `/uploads/${req.file.filename}`;
      if (mime.startsWith("audio/")) {
        audioUrl = filePath;
      } else if (mime.startsWith("video/")) {
        videoUrl = filePath;
      }
    }

    const result = await triggerSOS(
      req.user._id,
      {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        audioUrl,
        videoUrl
      },
      io
    );

    return successResponse(res, "SOS triggered successfully. Alerts dispatched.", result, 201);
  } catch (error) {
    next(error);
  }
};

export const handleResolveSOS = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sosLog = await resolveSOS(req.user._id, id);
    return successResponse(res, "SOS status resolved successfully.", { sosLog }, 200);
  } catch (error) {
    next(error);
  }
};

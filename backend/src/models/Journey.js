import mongoose from "mongoose";

const journeySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    origin: {
      type: String,
      required: true
    },
    destination: {
      type: String,
      required: true
    },
    selectedRoute: {
      distance: { type: Number, required: true },
      duration: { type: String, required: true },
      polyline: { type: String, required: true },
      safetyScore: { type: Number, required: true },
      riskLevel: { type: String, required: true },
      coordinates: {
        type: [[Number]], // [[lat, lng], ...]
        required: true
      }
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active"
    },
    currentLocation: {
      latitude: { type: Number },
      longitude: { type: Number }
    },
    locationHistory: [
      {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        timestamp: { type: Date, default: Date.now }
      }
    ],
    deviationLogs: [
      {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        timestamp: { type: Date, default: Date.now },
        distance: { type: Number, required: true }, // distance in meters away from route
        nearestSafePoint: {
          name: { type: String },
          latitude: { type: Number },
          longitude: { type: Number },
          category: { type: String }
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

const Journey = mongoose.model("Journey", journeySchema);
export default Journey;

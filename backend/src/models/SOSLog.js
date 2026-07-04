import mongoose from "mongoose";

const sosLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    },
    status: {
      type: String,
      enum: ["active", "resolved"],
      default: "active"
    },
    audioUrl: {
      type: String,
      default: ""
    },
    videoUrl: {
      type: String,
      default: ""
    },
    resolvedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

sosLogSchema.index({ location: "2dsphere" });

// Auto populate location before validating/saving
sosLogSchema.pre("validate", function () {
  if (this.latitude !== undefined && this.longitude !== undefined) {
    this.location = {
      type: "Point",
      coordinates: [this.longitude, this.latitude]
    };
  }
});

const SOSLog = mongoose.model("SOSLog", sosLogSchema);
export default SOSLog;

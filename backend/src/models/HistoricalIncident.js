import mongoose from "mongoose";

const historicalIncidentSchema = new mongoose.Schema(
  {
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
    category: {
      type: String,
      required: true,
      trim: true
    },
    severity: {
      type: String,
      required: true,
      enum: ["Low", "Medium", "High"]
    },
    year: {
      type: Number,
      required: true
    },
    source: {
      type: String,
      default: "Official Crime Records"
    }
  },
  {
    timestamps: true
  }
);

// Geo index for spatial query performance
historicalIncidentSchema.index({ location: "2dsphere" });

// Auto populate location before validating/saving
historicalIncidentSchema.pre("validate", function () {
  if (this.latitude !== undefined && this.longitude !== undefined) {
    this.location = {
      type: "Point",
      coordinates: [this.longitude, this.latitude]
    };
  }
});

const HistoricalIncident = mongoose.model("HistoricalIncident", historicalIncidentSchema);
export default HistoricalIncident;

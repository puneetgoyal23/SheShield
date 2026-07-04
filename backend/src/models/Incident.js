import mongoose from "mongoose";

const incidentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        "Harassment",
        "Suspicious Activity",
        "Poor Lighting",
        "Road Block",
        "Unsafe Crowd",
        "Police Patrol",
        "Accident"
      ]
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    journeyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Journey",
      required: false
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
    image: {
      type: String,
      default: ""
    },
    verificationCount: {
      type: Number,
      default: 0
    },
    verifiedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Geo-spatial index for proximity queries
incidentSchema.index({ location: "2dsphere" });

// Auto populate location before validation/saving
incidentSchema.pre("validate", function () {
  if (this.latitude !== undefined && this.longitude !== undefined) {
    this.location = {
      type: "Point",
      coordinates: [this.longitude, this.latitude]
    };
  }
});

const Incident = mongoose.model("Incident", incidentSchema);
export default Incident;

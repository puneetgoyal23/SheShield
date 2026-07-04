import mongoose from "mongoose";

const safePointSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
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
    category: {
      type: String,
      required: true,
      enum: [
        "Police Station",
        "Hospital",
        "Pharmacy",
        "Petrol Pump",
        "Hotel",
        "Metro Station",
        "Railway Station",
        "Bus Terminal",
        "Women Help Centre"
      ]
    },
    openStatus: {
      type: String,
      default: "Open 24/7"
    },
    googlePlaceId: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

// Geo index for spatial queries
safePointSchema.index({ location: "2dsphere" });

// Auto populate location before validating/saving
safePointSchema.pre("validate", function () {
  if (this.latitude !== undefined && this.longitude !== undefined) {
    this.location = {
      type: "Point",
      coordinates: [this.longitude, this.latitude]
    };
  }
});

const SafePoint = mongoose.model("SafePoint", safePointSchema);
export default SafePoint;

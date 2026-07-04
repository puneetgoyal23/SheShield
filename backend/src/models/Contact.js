import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    relationship: {
      type: String,
      required: true,
      trim: true
    },
    isPrimaryContact: {
      type: Boolean,
      default: false
    },
    isSOSContact: {
      type: Boolean,
      default: true // by default let's make them an SOS contact
    }
  },
  {
    timestamps: true
  }
);

// A user should not add the same phone number as a trusted contact twice
contactSchema.index({ userId: 1, phone: 1 }, { unique: true });

const Contact = mongoose.model("Contact", contactSchema);
export default Contact;

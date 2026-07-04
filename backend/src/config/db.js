import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connUri = process.env.Mongo_URI || process.env.MONGO_URI;
    if (!connUri) {
      throw new Error("MongoDB connection URI (Mongo_URI) is missing in environment variables.");
    }
    const conn = await mongoose.connect(connUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;

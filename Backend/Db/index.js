import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDB = async () => {
  try {
    // Insert database name before query parameters
    let uri = process.env.MONGODB_URI;
    
    // Check if URI has query parameters
    if (uri.includes('?')) {
      // Insert DB name before the ?
      uri = uri.replace('?', `/${DB_NAME}?`);
    } else {
      // No query params, just append
      uri = `${uri}/${DB_NAME}`;
    }
    
    const connectionInstance = await mongoose.connect(uri);
    console.log(
      `\n✅ MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("❌ MONGODB connection FAILED ", error);
    process.exit(1);
  }
};

export default connectDB;

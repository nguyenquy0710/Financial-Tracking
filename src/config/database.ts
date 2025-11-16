import mongoose from "mongoose";
import configApp from "./config";

// Function to connect to MongoDB using Mongoose
export const connectDB = async () => {
  try {
    const mongoURI = configApp.database.uri || process.env['MONGODB_URI'] || 'mongodb://localhost:27017/fintrack';
    console.log('🚀 QuyNH: connectDB -> mongoURI', mongoURI);

    const options: any = {
      useNewUrlParser: true,
      useUnifiedTopology: true
    };

    await mongoose.connect(mongoURI, options);

    console.log('✅ MongoDB connected successfully');

    mongoose.connection.on('error', (err: any) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
    });
  } catch (error: any) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('⚠️  Server will continue without database. API endpoints will not work.');
    // Don't exit - allow server to serve static files
  }
};

export default connectDB;

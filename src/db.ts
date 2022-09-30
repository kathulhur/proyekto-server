// setup mongodb connection
import colors from 'colors';
colors.enable();
import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
    const conn = await mongoose.connect(process.env.MONGODB_URI as string);
    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold)
}

export default connectDB;
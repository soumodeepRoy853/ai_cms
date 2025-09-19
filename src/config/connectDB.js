import mongoose from "mongoose";

const DbConnect = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB successfully");
    } catch (err) {
        console.error(`error: ${err.message}`);
        process.exit(1);
    }
}

export default DbConnect;
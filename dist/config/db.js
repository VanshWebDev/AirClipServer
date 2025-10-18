import mongoose from "mongoose";
const connectDB = async () => {
    const mongodbUrl = process.env.MONGODB_URL || "";
    try {
        await mongoose.connect(mongodbUrl);
        console.log("Connected to the database successfully ☘️");
        console.log("JAI SHRI RAM 🍁");
    }
    catch (err) {
        console.error(`Database not connected 🐞`, err);
        process.exit(1); // Exit process with failure
    }
};
export default connectDB;
//# sourceMappingURL=db.js.map
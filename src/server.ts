import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

const app = express();
const PORT = process.env.PORT;
const MONGO_URI =process.env.MONGO_URI;

//connect to MongoDB
async function connectToMongoDB(connectionString: string) {
  await mongoose.connect(connectionString);
  console.log("Connected to MongoDB");
}

try {
  connectToMongoDB(MONGO_URI);
} catch (err) {
  console.log("Error connecting to MongoDB:", err);
}

app.listen(PORT, () => {
  console.log(`App is running at http://localhost:${PORT}`);
});
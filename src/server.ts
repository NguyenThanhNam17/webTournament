import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import router from "./routers";
dotenv.config();

const app = express();
const PORT = process.env.PORT;
const MONGO_URI =process.env.MONGO_URI;


app.use(express.json()); // parse application/json
app.use(express.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded


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

app.use("/", router);

app.listen(PORT, () => {
  console.log(`App is running at http://localhost:${PORT}`);
});
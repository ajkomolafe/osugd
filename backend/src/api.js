import dotenv from "dotenv"
import mongoClient from "mongoose"
import express from "express"
import mongoose from "mongoose"
import userRouter from "./users/users.js"
import authRouter from "./auth/auth.js"

dotenv.config()
const api = express();

//MongoDB connection setup
mongoose.connect(process.env.DATABASE_URI);
const db = mongoose.connection;
db.on("error", (error) => console.log(error));
db.once("open", () => console.log("Connected to Database"));

//Express.js router and listening setup
api.use(express.json());
api.use("/api/auth", userRouter) //requests on localhost:3000/users go to userRouter
api.use("/api/users", userRouter) //requests on localhost:3000/users go to userRouter

api.listen(3000, () => console.log("Server Started"));
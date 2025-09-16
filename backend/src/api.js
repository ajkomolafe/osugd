import dotenv from "dotenv"
import cors from "cors"
import express from "express"
import mongoose from "mongoose"
import userRouter from "./users/users.js"
import authRouter from "./auth/auth.js"

dotenv.config()
const api = express();

//MongoDB connection setup
mongoose.connect(process.env.DATABASE_URI, {
    dbName: "prod",
    serverSelectionTimeoutMS: 5000, //5 sec
});
const db = mongoose.connection;
db.on("error", (error) => console.log(error));
db.once("open", () => console.log("Connected to Database"));

//Express.js router and listening setup
//To allow direct requests to backend
// api.use(cors({
//     origin: 'http://localhost:5173',
//     credentials: true,
// }))
api.use(express.json());
api.use("/api/auth", authRouter) //requests on localhost:3000/users go to userRouter
api.use("/api/users", userRouter) //requests on localhost:3000/users go to userRouter

api.listen(3000, () => console.log("Server Started"));
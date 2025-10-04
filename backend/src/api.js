import dotenv from "dotenv"
import express from "express"
import mongoose from "mongoose"
import userRouter from "./users/users.js"
import authRouter from "./auth/auth.js"
import Banchojs from "bancho.js"

dotenv.config()
const api = express();

mongoose.connect(process.env.DATABASE_URI, {
    dbName: "prod",
    serverSelectionTimeoutMS: 5000, //5 sec
});
const db = mongoose.connection;
db.on("error", (error) => console.log(error));
db.once("open", () => console.log("Connected to Database"));

const client = new Banchojs.BanchoClient({ username: process.env.IRC_USERNAME, password: process.env.IRC_PASSWORD });
client.connect().then(async () => {
    console.log("Connected to Bancho");
    // await client.getUser("Mildly Accurate").sendMessage("test")
}).catch(console.error);

api.use(express.json());
api.use("/api/auth", authRouter) //requests on host/auth go to authRouter
api.use("/api/users", userRouter) //requests on host/users go to userRouter

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

api.listen(port, () => console.log("API Started"));


import dotenv from "dotenv"
import express from "express"
import mongoose from "mongoose"
import userRouter from "./users/users.js"
import authRouter from "./auth/auth.js"
import irc from 'irc'

dotenv.config()
const api = express();

mongoose.connect(process.env.DATABASE_URI, {
    dbName: "prod",
    serverSelectionTimeoutMS: 5000, //5 sec
});
const db = mongoose.connection;
db.on("error", (error) => console.log(error));
db.once("open", () => console.log("Connected to Database"));

api.use(express.json());
api.use("/auth", authRouter) //requests on host/auth go to authRouter
api.use("/users", userRouter) //requests on host/users go to userRouter

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

api.listen(port, () => console.log("API Started"));

//move to osu irc package, this package likely incompatible with osu irc
// let client = new irc.Client('irc.ppy.sh', process.env.IRC_USERNAME, {
//     userName: process.env.IRC_USERNAME,
//     realName: process.env.IRC_USERNAME,
//     password: process.env.IRC_PASSWORD,
//     port: 6667,
//     // debug: true,
//     showErrors: false,
//     autoRejoin: true,
//     autoConnect: true,
//     secure: false,
//     retryCount: 3,
//     retryDelay: 2000,
// });

// await new Promise(resolve => client.on('registered', resolve));


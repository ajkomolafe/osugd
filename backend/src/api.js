require("dotenv").config();
const mongoClient = require('mongoose');
const express = require("express");
const mongoose = require("mongoose");
const api = express();

//MongoDB connection setup
mongoose.connect(process.env.DATABASE_URI);
const db = mongoose.connection;
db.on("error", (error) => console.log(error));
db.once("open", () => console.log("Connected to Database"));

//Express.js router and listening setup
api.use(express.json());
const userRouter = require("./users/users.js");
api.use("/users", userRouter) //requests on localhost:3000/users go to userRouter

api.listen(3000, () => console.log("Server Started"));
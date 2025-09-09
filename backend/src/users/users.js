import axios from 'axios';
import express from 'express';
import userSchema from './user.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

/*Error numbers
200~ Good request
400~ User fault
500~ Server fault
*/

//Get users, may or may not have parameters
//TODO: paginate
router.get("/", async (req, res) => {
    console.log("GET /users " + JSON.stringify(req.query));
    try {
        //Requesting one user with query (?=) syntax
        if (req.query.email != null){
            const user = await userSchema.findOne({ email: req.query.email });
            if (user != null){
                res.status(200).json(user);
            }
            else {
                return res.status(404).json({ message: "User does not exist" });
            }
        }

        //Requesting all users
        else {
            console.log("All Users");
            const allUsers = await userSchema.find();
            res.json(allUsers);
        }
    }
    catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
});

//Create a user, json as param
router.post("/", async (req, res) => {
    const user = new userSchema({
        full_name: req.body.full_name,
        email: req.body.email,
        auth: ""
    });

    try {
        const savedStatus = await user.save();
        res.status(201).json(savedStatus);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});

//Update one user
//Uses patch to not overwrite info already there
router.patch("/:email", async (req, res) => {
    try {
        var user = await userSchema.findOne({ email: req.params.email });
        if (req.body.full_name != null){
            user.full_name = req.body.full_name;
        }
        const updateStatus = user.save();
        res.json(updateStatus);
    }
    catch (err){
        res.status(400).json({ message: err.message });
    }
});

//Delete one user
router.delete("/:email", async (req, res) => {
    try {
        const user = await userSchema.findOne({ email: req.params.email });
        if (user == null){
            res.status(404).json("User does not exist");
            return;
        }
        else {
            //Remove is deprecated, use deleteOne
            await userSchema.deleteOne({ email: req.params.email });
            res.json("Deleted User");
        }
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
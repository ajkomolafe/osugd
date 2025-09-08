const mongoose = require("mongoose");

//Input validation schema
const userSchema = mongoose.Schema({
    full_name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        //Only @tamu.edu emails
        match: new RegExp(".+@tamu\.edu")
    },

    //Usage of auth requires setting up Azure Web Services for Microsoft Email Logins
    auth: {
        type: String
    }
})

module.exports = mongoose.model("user", userSchema);
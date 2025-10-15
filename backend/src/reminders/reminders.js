import axios from 'axios';
import express from 'express';
import jwt from 'jsonwebtoken';
import { getCookie } from '../cookie.js'
import Reminder from './reminder.js'
import { response_codes } from '../response_codes.js';

const router = express.Router();

// POST: Add/upsert Reminder
// All measurements are in seconds
router.post("/", async (req, res) => {
    const frequency = req.body.frequency
    const start_time = req.body.start_time

    if (isNaN(Number(frequency))){
        return res.status(response_codes.BAD_REQUEST).json({
            hint: "frequency is in an invalid format"
        })
    }

    if (isNaN(Number(start_time))){
        return res.status(response_codes.BAD_REQUEST).json({
            hint: "start time is in an invalid format"
        })
    }
    
    if (frequency < 6 * 60 * 60){ // 6 hours
        return res.status(response_codes.BAD_REQUEST).json({
            hint: "frequency is too short. minimum of 6 hours between reminders"
        })
    }

    if (start_time < (Date.now() / 1000) - (24 * 60 * 60)){
        return res.status(response_codes.BAD_REQUEST).json({
            hint: "start time is too far in past, should start from last 24 hours"
        })
    }

    const cookie = getCookie(req, "session")
    if (cookie == null) {
        return res.status(response_codes.BAD_REQUEST).json({
            hint: "missing cookie"
        })
    }

    const unhashedCookie = jwt.verify(cookie, process.env.JWT_SECRET)
    if (unhashedCookie.expireTime == null || unhashedCookie.accessToken == null || unhashedCookie.refreshToken == null){
        return res.status(response_codes.BAD_REQUEST).json({
            hint: "cookie is an invalid format"
        })
    }

    let id
    let username
    try {
        let response = await axios.get("https://osu.ppy.sh/api/v2/me", {
            headers: {
                "Authorization": "Bearer " + unhashedCookie.accessToken,
            },
        })
        id = response.data.id
        username = response.data.username
    }
    catch (err) {
        console.log("POST /api/reminders/: Error: " + err.message)
        if (err.status != null){
            return res.status(response_codes.BAD_REQUEST).json({
                message: err.message,
                hint: "cookie is likely expired"
            })
        }
        return res.status(response_codes.SERVER_ERROR).json({
            message: err.message,
        })
    }

    await Reminder.updateOne(
        { 
            ogd_user_id: id,
        },
        { 
            last_reminder: start_time,
            reminder_frequency: req.body.frequency,
        },
        { 
            runValidators: true,
            upsert: true,
        }
    ).catch((err) => {
        console.log("POST /api/reminders/: Error adding to database ")
        return res.status(400).json({ hint: "error adding to database" });
    })

    console.log("POST /api/reminders/: " + username)

    return res.status(response_codes.OK).json();
})

export default router;
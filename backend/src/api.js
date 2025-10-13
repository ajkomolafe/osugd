import dotenv from "dotenv"
import express from "express"
import mongoose from "mongoose"
import userRouter from "./users/users.js"
import authRouter from "./auth/auth.js"
import Banchojs from "bancho.js"
import Reminder from './users/reminder.js'
import Beatmapset from './users/beatmapset.js'

dotenv.config()
const api = express();

mongoose.connect(process.env.DATABASE_URI, {
    dbName: "prod",
    serverSelectionTimeoutMS: 5000, //5 sec
});
const db = mongoose.connection;
db.on("error", (error) => console.log(error));
db.once("open", () => console.log("Connected to Database"));

const client = new Banchojs.BanchoClient({ username: process.env.IRC_USERNAME, password: process.env.IRC_PASSWORD, apiKey: process.env.BANCHO_API_KEY });

api.use(express.json());
api.use("/api/auth", authRouter) //requests on host/auth go to authRouter
api.use("/api/users", userRouter) //requests on host/users go to userRouter

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

api.listen(port, () => console.log("API Started"));

// Every hour, check if there are reminders to be sent.
// If a reminder should be sent, get first 3 beatmap names, and send that in the message.
async function checkReminders() {
	const reminders = await Reminder.find( { } ).catch((err) => {
		console.log(err)
	})
	for (const reminder of reminders){
		if ((reminder.last_reminder + reminder.reminder_frequency) < (Date.now() / 1000)){

			const beatmapsets = await Beatmapset.find({
				ogd_user_id: reminder.ogd_user_id,
				$or: [{status: "pending"}, {status: "graveyard"}]
			}).limit(3);

			if (beatmapsets.length == 0){
				// No maps to remind the user about
				continue
			}

			// Finish message setup later
			let message = "ogd: You have " + beatmapsets.length + " guest difficulty to complete: " + beatmapsets[0].creator_username + "'s " + beatmapsets[0].title + ". https://ogd.akomolafe.dev"

			let user = await client.getUserById(Number(reminder.ogd_user_id))
			await user.sendMessage(message)

			await Reminder.findOneAndUpdate({
				ogd_user_id: reminder.ogd_user_id,
			}, {
				last_reminder: Date.now() / 1000,
			}).orFail()
			
			console.log("Reminded user " + user.ircUsername + " at " + (new Date()).toLocaleString('en-US', {
				timeZone: 'CST',
				timeZoneName: "short",
				day: "numeric",
				month: "long",
				year: "numeric",
				hour: "numeric",
				minute: "numeric",
			} ))
		}
	}

	setTimeout(checkReminders, 5 * 60 * 1000)
}

function waitForDatabase() {
 	if (db.readyState === 1){
		return Promise.resolve();
	}
  	return new Promise((resolve, reject) => {
		db.once("open", resolve);
		db.once("error", reject);
  });
}


function waitForBancho() {
 	if (client.getConnectState() === Banchojs.ConnectStates.Connected){
		return Promise.resolve();
	}
  	return new Promise((resolve) => {
		function checkConnectState() {
			if (client.getConnectState() === Banchojs.ConnectStates.Connected){
				resolve()
			}
			setTimeout(checkConnectState, 1000)
		}
		checkConnectState()
  });
}

async function start() {
  	try {
    	client.connect()
    	await Promise.all([waitForDatabase(), waitForBancho()]);
		console.log("Connected to Bancho")

    	checkReminders()
  	} catch (err) {
    	console.log(err);
		throw err
  }
}

start();
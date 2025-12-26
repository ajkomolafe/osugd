import dotenv from "dotenv"
import express from "express"
import mongoose from "mongoose"
import authRouter from "./auth/auth.js"
import userRouter from "./users/users.js"
import beatmapsetRouter from "./beatmapsets/beatmapsets.js"
import remindersRouter from "./reminders/reminders.js"
import Banchojs from "bancho.js"
import Reminder from './reminders/reminder.js'
import Beatmapset from './beatmapsets/beatmapset.js'

dotenv.config()
const api = express();

mongoose.connect(process.env.DATABASE_URI, {
    dbName: "prod",
    serverSelectionTimeoutMS: 5000, //5 sec
	writeConcern: { w: 'majority' },
});
const db = mongoose.connection;
db.on("error", (error) => console.log(error));
db.once("open", () => console.log("Connected to Database"));

const client = new Banchojs.BanchoClient({ username: process.env.IRC_USERNAME, password: process.env.IRC_PASSWORD, apiKey: process.env.BANCHO_API_KEY });

api.use(express.json());
api.use("/api/auth", authRouter) //requests on host/auth go to authRouter
api.use("/api/users", userRouter) //requests on host/users go to userRouter
api.use("/api/beatmapsets", beatmapsetRouter) //requests on host/auth go to authRouter
api.use("/api/reminders", remindersRouter) //requests on host/users go to userRouter

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

api.listen(port, () => console.log("API Listening on 127.0.0.1:" + port));

function beatmapsetLink(beatmapset_id){
	return "https://osu.ppy.sh/s/" + beatmapset_id
}

// Every 15 mins, check if there are reminders to be sent.
// If a reminder should be sent, get first 3 beatmap names, and send that in the message.
async function checkReminders() {
	const reminders = await Reminder.find( { } ).catch((err) => {
		console.log(err)
	})
	for (const reminder of reminders){
		if ((reminder.last_reminder + reminder.reminder_frequency) < (Date.now() / 1000)){

			const total_user_beatmapsets_promise = Beatmapset.countDocuments({
				ogd_user_id: reminder.ogd_user_id,
				completed: false,
			}).exec();

			const beatmapsets_promise = Beatmapset.find({
				ogd_user_id: reminder.ogd_user_id,
				completed: false,
			}).limit(2).exec();

			const [total_user_beatmapsets, beatmapsets] = await Promise.all([total_user_beatmapsets_promise, beatmapsets_promise])

			if (beatmapsets.length == 0){
				// No maps to remind the user about
				continue
			}

			let message
			// sort by added time, oldest first, need to make an edit api so it doesnt modify time
			if (total_user_beatmapsets == 1){
				message = `[https://ogd.isle.to/ ogd]: 
				You have ${total_user_beatmapsets} guest difficulty to complete: 
				${beatmapsets[0].creator_username}'s [${beatmapsetLink(beatmapsets[0].beatmapset_id)} ${beatmapsets[0].title}].`
			} 
			else if (total_user_beatmapsets == 2){
				message = `[https://ogd.isle.to/ ogd]: 
				You have ${total_user_beatmapsets} guest difficulties to complete: 
				${beatmapsets[0].creator_username}'s [${beatmapsetLink(beatmapsets[0].beatmapset_id)} ${beatmapsets[0].title}] and 
				${beatmapsets[1].creator_username}'s [${beatmapsetLink(beatmapsets[1].beatmapset_id)} ${beatmapsets[1].title}].`
			}
			else if (total_user_beatmapsets >= 3){
				message = `[https://ogd.isle.to/ ogd]: 
				You have ${total_user_beatmapsets} guest difficulties to complete: 
				${beatmapsets[0].creator_username}'s [${beatmapsetLink(beatmapsets[0].beatmapset_id)} ${beatmapsets[0].title}], 
				${beatmapsets[1].creator_username}'s [${beatmapsetLink(beatmapsets[1].beatmapset_id)} ${beatmapsets[1].title}], 
				and ${total_user_beatmapsets - 2} more.`
			}
			message = message.replace(/[\t\n\r]/g, ""); // Strip tabs/newlines

			let user = await client.getUserById(Number(reminder.ogd_user_id))
			await user.sendMessage(message)

			let next_reminder_time = reminder.last_reminder
			while (next_reminder_time < (Date.now() / 1000)){
				next_reminder_time += reminder.reminder_frequency
			}

			await Reminder.findOneAndUpdate({
				ogd_user_id: reminder.ogd_user_id,
			}, {
				last_reminder: next_reminder_time,
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

	setTimeout(checkReminders, 15 * 60 * 1000)
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
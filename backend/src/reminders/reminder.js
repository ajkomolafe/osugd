import mongoose from 'mongoose'

//Input validation schema
const reminderSchema = new mongoose.Schema({
    ogd_user_id: { //pk
        type: Number,
        required: true,
    },
    last_reminder: {
        type: Number,
        required: true,
    },
    reminder_frequency: {
        type: Number,
        required: true,
    }
})

export default mongoose.model("reminder", reminderSchema, "reminders")
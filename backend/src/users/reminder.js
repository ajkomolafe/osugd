import mongoose from 'mongoose'

//Input validation schema
const reminderSchema = new mongoose.Schema({
    id: { //pk
        type: Number,
        required: true,
    },
    next_reminder: {
        type: Number,
        required: true,
    },
    reminder_frequency: {
        type: Number,
        required: true,
    }
})

export default mongoose.model("reminder", reminderSchema, "reminders")
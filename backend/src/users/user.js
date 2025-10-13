import mongoose from 'mongoose'

//Input validation schema
const userSchema = new mongoose.Schema({
    ogd_user_id: {
        type: Number,
        required: true,
        unique: true,
    },
    username: {
        type: String,
    },
})

export default mongoose.model("user", userSchema, "users");
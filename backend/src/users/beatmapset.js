import mongoose from 'mongoose'

//Input validation schema
const beatmapsetSchema = new mongoose.Schema({
    beatmapset_id: { //pk
        type: Number,
        required: true,
    },
    ogd_user_id: { //pk
        type: Number,
        required: true,
    },
    difficulty: {
        type: String,
        required: true,
    },
    difficulty: {
        type: String,
        required: true,
    },
    artist: {
        type: String,
        required: true,
    },
    artist_unicode: {
        type: String,
        required: true,
    },
    cover: {
        type: String,
        required: true,
    },
    source: {
        type: String,
        // required: true, //can be empty string
    },
    status: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    title_unicode: {
        type: String,
        required: true,
    },
    creator_id: {
        type: Number,
        required: true,
    },
    creator_username: {
        type: String,
        required: true,
    }
})

export default mongoose.model("beatmapset", beatmapsetSchema, "beatmapsets")
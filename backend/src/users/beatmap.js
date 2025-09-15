import mongoose from 'mongoose'

//Input validation schema
const beatmapSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true,
    },
    type: {
        type: String,
        required: true,
    },
    ogd_user_id: {
        type: Number,
        required: true,
        unique: true,
    },
    creator: {
        type: Number, //id or string
        required: true,
    },
    artist: {
        type: String,
        required: true,
    },
    unicode_artist: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    unicode_title: {
        type: String,
        required: true,
    },
    source: {
        type: String,
        required: true,
    },
})

const Beatmap = mongoose.model("beatmap", beatmapSchema, "beatmaps");

export default Beatmap
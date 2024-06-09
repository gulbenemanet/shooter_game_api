const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gameSchema = new Schema({
    name: {
        type: String,
        //required: true,
        trim: true,
        minlength: 3,
        maxlength: 50
    },
    createdBy: { 
        type: String,
        required: true 
    },
    roomid: {
        type: Number
    },
    gameAdmin: {
        type: Number
    },
    participants: [],
    status: {
        type: String,
        //required: true,
        default: 'waiting', // beklemede, oyunda, bitti
    },
    start_end_date:{
        type: String,
    },
}, { collection: 'games' })

const Game = mongoose.model('Games', gameSchema)

module.exports = Game;
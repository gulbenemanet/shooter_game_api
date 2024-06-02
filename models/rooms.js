const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomSchema = new Schema({
    name: {
        type: String,
        //required: true,
        trim: true,
        minlength: 3,
        maxlength: 50
    },
    roomid: {
        type: Number
    },
    roomAdmin: {
        type: Number
    },
    count: {
        type: Number,
        default: 1
    },
    status: {
        type: String,
        //required: true,
        default: "waiting",
        trim: true,
        minlength: 3,
        maxlength: 50
    },
}, { collection: 'rooms' })

const Room = mongoose.model('Rooms', roomSchema)

module.exports = Room;
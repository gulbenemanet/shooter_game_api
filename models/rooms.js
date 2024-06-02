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
        type: Number
    },
    status: {
        type: String,
        //required: true,
        trim: true,
        minlength: 3,
        maxlength: 50
    },
}, { collection: 'game' })

const Room = mongoose.model('Rooms', roomSchema)

module.exports = Room;
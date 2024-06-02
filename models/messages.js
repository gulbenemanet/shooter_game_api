const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    senderId: {
        type: Number
    },
    roomid: {
        type: Number
    },
    messageText: {
        type: String,
        //required: true,
        trim: true,
        minlength: 3,
        maxlength: 50
    },
    date:{
        type: String,
    },
}, { collection: 'game' })

const Message = mongoose.model('Messages', messageSchema)

module.exports = Message;
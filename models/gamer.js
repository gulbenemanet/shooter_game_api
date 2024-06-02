const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gamerSchema = new Schema({
    name: {
        type: String,
        //required: true,
        trim: true,
        minlength: 3,
        maxlength: 50
    },
    username: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 50
    },
    password: {
        type: String,
        required: true,
    },
    email:{
        type: String,
        trim: true,
        minlength: 3,
        maxlength: 50
    },
    point: {
        type: String,
    }
}, { collection: 'game' })

const Gamer = mongoose.model('Gamer', gamerSchema)

module.exports = Gamer;
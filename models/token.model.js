const mongoose = require('mongoose');


const TokenSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Types.ObjectId,
        ref: 'User',
    },
    token:{
        type: String
    }
})

module.exports = mongoose.model('Token',TokenSchema)

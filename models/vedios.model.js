const mongoose = require('mongoose');
const fs = require('fs')
const VedioSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'pleace input the title'],
        unique: [true, 'pleace try with another title']
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
    },
    vedioName: {
        type: String
    },
    ImageCoverName: {
        type: String
    },
    category: {
        type: String
    },
}, {
    timestamps: true
})

VedioSchema.virtual('coverImagePath').get(function() {
    if (this.ImageCoverName != null && this.ImageCoverName != null) {
        return `/upload/${this.userId}/${this.ImageCoverName}`
    }
})

VedioSchema.virtual('vedioNamePath').get(function() {
    if (this.vedioName != null && this.vedioName != null) {
        return `/upload/${this.userId}/${this.vedioName}`
    }
})

module.exports = mongoose.model('Vedio', VedioSchema)
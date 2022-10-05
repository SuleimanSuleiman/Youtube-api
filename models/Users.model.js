const mongoose = require('mongoose');
const {
    isEmail
} = require('validator')
const bcrypt = require('bcryptjs');
const {
    handleError,
    handleMessageError
} = require('../utils/handleErrors');


const UserSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: [true, 'pleace input the first name']
    },
    last_name: {
        type: String,
        required: [true, 'pleace input the last name']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'pleace input the email'],
        validate: [isEmail, 'pleace input currect email'],
    },
    password: {
        type: String,
        minlength: [8, 'should be longer of 8'],
        // required: [true, 'pleace input the password'],
    },
    verify: {
        type: Boolean,
    },
    google: {
        profileId: {
            type: String
        },
    },
    vedios: [{
        type: mongoose.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
})

UserSchema.pre('save', async function () {
    if (!this.google.profileId) {
        if (!this.password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/ig)) {
            throw Error('pleace try with strong password')
        }
        const salt = await bcrypt.genSalt()
        this.password = await bcrypt.hash(this.password, salt)
    }
})

UserSchema.statics.loginUser = async function (email, password, next) {
    try {
        const theUser = await this.findOne({
            email: email
        })
        if (!theUser) next(handleError(404, 'not found'))
        const verifyPassword = await bcrypt.compare(password, theUser.password)
        if (!verifyPassword) throw Error('incurrect password')
        return theUser

    } catch (err) {
        const handle = handleMessageError(err)
        next(handleError(400,handle))
    }
}

module.exports = mongoose.model('User', UserSchema)
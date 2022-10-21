const nodemailer = require("nodemailer");
const User =require('../models/Users.model')

module.exports.sendEmail = async (email, subject, message) => {
    try {
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            auth: {
                user: 'zmamznan66@gmail.com',
                pass: process.env.PASSOWRD_EMAIL,
            },
        });

        let info = await transporter.sendMail({
            from: '"Youtube 👻" <zmamznan66@gmail.com>',
            to: email,
            subject: subject,
            text: message,
        });
        console.log('The email send successful ...');
    } catch(err){
        let theUser = await User.findOne({email: email})
        if(theUser){
            await User.findOneAndRemove({email: email})
        }
        console.log(err)
        console.log('The email  didn`t send...')
    }
}

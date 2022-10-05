const JwtStrategy = require('passport-jwt').Strategy
const passport = require('passport');
const User = require('../models/Users.model')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const {
    ObjectId
} = require('mongodb')
const mongoose = require('mongoose')

module.exports = (passport) => {
    try {
        passport.serializeUser((user, done) => {
            done(null, {
                id: user.id,
                verify: user.verify
            })
        })

        passport.deserializeUser(async (id, done) => {
            const theUser = await User.findById(id)
            if (theUser) done(null, theUser)
        })

        passport.use(new JwtStrategy({
            jwtFromRequest: (req) => {
                const JWTtoken = req.cookies.jwt
                let token = new String()
                if (JWTtoken) {
                    token = JWTtoken
                }
                return token
            },
            secretOrKey: process.env.SECRETJWT,
        }, async (jwt_payload, done) => {
            const theUser = await User.aggregate([{
                $match: {
                    _id: {
                        $eq: ObjectId(jwt_payload.id)
                    },
                    verify: {
                        $eq: true
                    }
                }
            }])
            if (theUser) return done(null, theUser[0])
            return done(null, false)
        }));
        passport.use(new GoogleStrategy({
                callbackURL: "http://localhost:4000/google/callback",
                passReqToCallback: true
            },
            async (request, accessToken, refreshToken, profile, done) => {
                try {
                    const theUser = await User.findOne({
                        'google.profileId': profile.id
                    })
                    if (theUser) return done(null, theUser)
                    console.log('create new user')
                    let newUser = new User({
                        google: {
                            profileId: profile.id
                        },
                        first_name: profile._json.given_name,
                        last_name: profile._json.family_name,
                        email: profile._json.email,
                        verify: profile._json.email_verified,
                    })
                    await newUser.save()
                    done(null, newUser)
                } catch (err) {
                    done(err, false)
                }
            }
        ));
    } catch (err) {
        console.log(err)
        throw Error('an error happened')
    }
}
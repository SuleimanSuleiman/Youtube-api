const express = require('express')
const router = express.Router()
const UserConroller = require('../controllers/User.controller')
const passport = require('passport')
const { handleError } = require('../utils/handleErrors')
require('../utils/passport')(passport)

router.get(`/verify/:userId/:tokenId`, UserConroller.verifyUser)
router.get('/profile',
    passport.authenticate('jwt'),
    (req,res,next) =>{
        try{
            const output = new Object()
            Object.entries(req.user).forEach(([key,value])=>{
                if(!(key.includes('password') || key.includes('_id'))){
                    output[key] = value
                }
            })
            res.status(200).json(output)
        }catch(err){
            next(handleError(400,err.message,err))
        }
    }
)
router.get('/logout',
passport.authenticate('jwt'),
UserConroller.logout)

router.post('/signup', UserConroller.CreateUser)
router.post('/login', UserConroller.login)


router.put('/changePassword',
passport.authenticate('jwt'),
UserConroller.changePassword)

router.delete('/deleteUser',
passport.authenticate('jwt'),
UserConroller.deleteUser)


module.exports = router
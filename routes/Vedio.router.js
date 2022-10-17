const express = require('express')
const router = express.Router()
const VedioController = require('../controllers/Vedio.controller')
const passport = require('passport')
require('../utils/passport')(passport)
const multer = require('multer')

const storage1 = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `upload/${req.user._id}`)
    }
})


const dest1 = multer({
    storage: storage1
})



router.post('/addVedio', [passport.authenticate('jwt'), dest1.array('file')], VedioController.AddVedio)

router.get('/showVedio', VedioController.showVedio)

router.delete('/deleteVedio/:VedioId',
passport.authenticate('jwt'),
    VedioController.deleteVedio)

router.put('/updateVedio/:VideoId',
    [passport.authenticate('jwt'),dest1.single('file')],
VedioController.updateVedio)


module.exports = router

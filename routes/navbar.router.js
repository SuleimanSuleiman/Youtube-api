const express = require('express');
const router= express.Router();
const NavController = require('../controllers/navbar.controller')
const { filterAnyReq} = require('../utils/filterRequest')

router.get("/", filterAnyReq,NavController.randomVideo);
router.get('/trend',filterAnyReq, NavController.trend)
router.get("/channel/:userId",filterAnyReq, NavController.sub);
router.get('/view/:videoId',filterAnyReq,NavController.viewVideo)

module.exports = router

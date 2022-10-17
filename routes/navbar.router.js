const express = require('express');
const router= express.Router();
const NavController = require('../controllers/navbar.controller')

router.get("/", NavController.randomVideo);
router.get('/trend', NavController.trend)
router.get("/chennal/:userId", NavController.sub);
module.exports = router

const express = require("express");
const passport = require("passport");
const router = express.Router();
const NavController = require("../controllers/other.controller");
const {
  filterAnyReq,
  filterGetVideoByTags,
} = require("../utils/filterRequest");

router.get("/", filterAnyReq, NavController.randomVideo);
router.get("/trend", filterAnyReq, NavController.trend);
router.get("/channel/:userId", filterAnyReq, NavController.sub);
router.get("/view/:videoId", filterAnyReq, NavController.viewVideo);
router.get("/getVideo", filterGetVideoByTags, NavController.getByTags);
router.get("/search", NavController.search);
router.put("/like/:videoId", passport.authenticate("jwt"), NavController.like);
router.put("/dislike/:videoId", passport.authenticate("jwt"), NavController.dislike);

module.exports = router;

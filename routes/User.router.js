const express = require("express");
const router = express.Router();
const UserConroller = require("../controllers/User.controller");
const passport = require("passport");
const { handleError } = require("../utils/handleErrors");
const {
  filterAnyReq,
  filterSignUp,
  filterLogin,
  filterChangePassword,
  filterDeleteUser,
} = require("../utils/filterRequest");
require("../utils/passport")(passport);

router.get(`/verify/:userId/:tokenId`, filterAnyReq, UserConroller.verifyUser);

router.get(
  "/profile",
  [filterAnyReq, passport.authenticate("jwt")],
  (req, res, next) => {
    try {
      const output = new Object();
      Object.entries(req.user).forEach(([key, value]) => {
        if (!(key.includes("password") || key.includes("_id"))) {
          output[key] = value;
        }
      });
      res.status(200).json(output);
    } catch (err) {
      next(handleError(400, err.message, err));
    }
  }
);
router.get(
  "/logout",
  [filterAnyReq, passport.authenticate("jwt")],
  UserConroller.logout
);
router.post("/signup", filterSignUp, UserConroller.CreateUser);
router.post("/login", filterLogin, UserConroller.login);
router.get(
  "/sub/:id",
  [filterAnyReq, passport.authenticate("jwt")],
  UserConroller.subscribers
);
router.get(
  "/unsub/:id",
  [filterAnyReq, passport.authenticate("jwt")],
  UserConroller.unsubscribers
);
router.put(
  "/changePassword",
  [filterChangePassword, passport.authenticate("jwt")],
  UserConroller.changePassword
);
router.delete(
  "/deleteUser",
  [filterDeleteUser, passport.authenticate("jwt")],
  UserConroller.deleteUser
);

module.exports = router;

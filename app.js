require("dotenv").config();

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const UserRouter = require("./routes/User.router");
const VedioRouter = require("./routes/Vedio.router");
const HomeUser = require("./routes/other.router");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const jwt = require("jsonwebtoken");
const { CreateFolder } = require("./utils/CreateFolder");
const { handleError } = require("./utils/handleErrors");
const moment = require("moment");

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB);
    console.log(`connect with mongodb`);
  } catch (err) {
    throw Error("error in connect with database");
  }
};

mongoose.connection.on("disconnected", () => {
  console.log("disconnect database");
});

mongoose.connection.on("connected", () => {
  console.log("connect mongodb");
});

app.use(express.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SECRETJWT,
    saveUninitialized: true,
    resave: false,
    cookie: { secure: true },
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use("/", HomeUser);
app.use("/home/user", UserRouter);
app.use("/home/vedio", VedioRouter);

//Google Strategy
require("./utils/passport")(passport);
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["email", "profile"],
  })
);

app.get(
  "/google/callback",
  passport.authenticate("google"),
  async function (req, res, next) {
    try {
      const token = jwt.sign(
        {
          id: req.user._id,
          verify: req.user.verify,
        },
        process.env.SECRETJWT,
        {
          expiresIn: "2h",
        }
      );
      res.cookie("jwt", token, {
        httpOnly: true,
      });
      await CreateFolder(req.user._id);
      res.json(req.user);
    } catch (err) {
      next(handleError(500, err.message));
    }
  }
);



app.use((err, req, res, next) => {
  const status = err.status || 500;
  const errMessage = err.message || "an error happend";
  return res.status(status).json({
    success: false,
    message: errMessage,
    stack: err.stack,
  });
});

app.use((req, res) => {
  if (req.accepts('json')) {
      res.status(400).json({
        success: false,
        message: "not found this page",
      });
  }
})

module.exports = {
  app,
  connect,
};

const User = require("../models/Users.model");
const Token = require("../models/token.model");
const { sendEmail } = require("../utils/sendEmail");
const { handleError, handleMessageError } = require("../utils/handleErrors");
const { CreateFolder } = require("../utils/CreateFolder");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const { ObjectId } = require("mongodb");

module.exports.CreateUser = async (req, res, next) => {
  try {
    console.log(req.body)
    let newUser = await User(req.body);
    await newUser.save();
    const the_token = GenerateToken();
    const message = `${process.env.URL}/home/user/verify/${newUser._id}/${the_token}`;
    // await sendEmail(req.body.email, 'Verify the Email', message)
    const tokenObj = await Token({
      userId: newUser._id,
      token: the_token,
    });
    await tokenObj.save();
    const { _id, password, google, verify, vedios, ...other } = newUser._doc;
    res.status(201).json({
      ...other,
    });
  } catch (err) {
    const theMes = await handleMessageError(err);
    next(handleError(400, "an error happend", theMes));
  }
};

module.exports.verifyUser = async (req, res, next) => {
  try {
    let theUser = await User.findById(req.params.userId);
    if (!theUser) next(handleError(404, "Dont find this user"));
    let the_token = await Token.findById(req.params.tokenId);
    if (!the_token) next(handleError(400, "Bad Request"));
    if (JSON.stringify(the_token.userId) !== JSON.stringify(theUser._id)) {
      next(handleError(400, "Bad Request"));
    }
    await User.findOneAndUpdate(
      {
        _id: theUser._id,
      },
      {
        $set: {
          verify: true,
        },
      }
    );
    await Token.findOneAndRemove({
      _id: the_token._id,
    });
    await createJwtSign(res, theUser);
    await CreateFolder(theUser._id);
    res.status(200).send("verify the email");
  } catch (err) {
    next(handleError(501, "an error happend", err));
  }
};

module.exports.login = async (req, res, next) => {
  try {
    const theUser = await User.loginUser(
      req.body.email,
      req.body.password,
      next
    );
    if (!theUser.verify) next(handleError(403, "pleace verify your email"));
    await createJwtSign(res, theUser);
    const { google, password, createdAt, updatedAt, ...others } = theUser._doc;
    await CreateFolder(theUser._id);
    res.status(200).json({
      ...others,
    });
  } catch (err) {
    console.log(err);
    next(handleError(400));
  }
};

module.exports.changePassword = async (req, res, next) => {
  try {
    const TheInput = {
      Last: req.body.LastPassword,
      New: req.body.NewPassword,
    };
    const verifyPassword = await bcrypt.compare(
      TheInput.Last,
      req.user.password
    );
    if (!verifyPassword) next(handleError(400, "incurrect password"));
    let updateUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          password: TheInput.New,
        },
      },
      {
        new: true,
      }
    );
    await updateUser.save();
    res.json(updateUser);
  } catch (err) {
    next(handleError(500));
  }
};

module.exports.logout = async (req, res, next) => {
  try {
    const jwtToken = await req.cookies.jwt;
    if (!jwtToken) next(handleError(400));
    res.cookie("jwt", process.env.SECRETJWT, {
      maxAge: 1,
    });
    res.json({
      success: true,
    });
  } catch (err) {
    next(handleError(400, err));
  }
};

module.exports.deleteUser = async (req, res, next) => {
  try {
    console.log(req.body,req.query)
    const comparePassword = await bcrypt.compare(
      req.body.password,
      req.user.password
    );
    if (!comparePassword) next(handleError(400, "incurrect password"));
    const LastUser = await User.findByIdAndRemove(req.user._id, {
      new: true,
    });
    res.cookie("jwt", process.env.SECRETJWT, {
      maxAge: 1,
    });
    let path = `./upload/${LastUser._id}`;
    console.log(path);
    fs.access(path, (err) => {
      if (!err) {
        fs.rmSync(path, {
          recursive: true,
          force: true,
        });
      } else {
        console.log("not found");
      }
    });
    res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    next(handleError(400, err.message));
  }
};

module.exports.subscribers = async (req, res, next) => {
  try {
    console.log(req.body,req.query)
    await sunAndunsub(req,req.params.id, true, next);
    res.status(200).json({
      stats: "successful",
    });
  } catch (err) {
    next(handleError(400, err.message, err));
  }
};

module.exports.unsubscribers = async (req, res, next) => {
  try {
    await sunAndunsub(req,req.params.id, false, next);
    res.status(200).json({
      stats: "successful",
    });
  } catch (err) {
    next(handleError(400, err.message, err));
  }
};

function GenerateToken() {
  const charset = "abcdefghijklmnopqrstuvwxyzABCEFGHIJUVWXYZ0123456789";
  let the_token = new String();
  for (let i = 0; i < charset.length; i++) {
    the_token += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return the_token;
}

async function createJwtSign(res, theUser) {
  const token = await jwt.sign(
    {
      id: theUser._id,
      verify: theUser.verify,
    },
    process.env.SECRETJWT,
    {
      expiresIn: "3h",
    }
  );
  res.cookie("jwt", token, {
    httpOnly: true,
  });
}

async function sunAndunsub(req,theId, sub, next) {
  const theUser = await User.findById(theId);
  if (!theUser) next(handleError(404, `not found this user => ${theId}`));
  if (sub) {
    await User.findOneAndUpdate(
      { _id: ObjectId(theId) },
      {
        $inc: {
          subscribers: 1,
        },
        $push: {
          subscribersUsers: req.user._id,
        },
      }
    );
  } else {
    await User.findOneAndUpdate(
      { _id: ObjectId(theId) },
      {
        $inc: {
          subscribers: -1,
        },
        $pull: {
          subscribersUsers: {
            $eq: req.user._id,
          },
        },
      }
    );
  }
}

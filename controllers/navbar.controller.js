const UsersModel = require("../models/Users.model");
const Vedio = require("../models/vedios.model");
const { handleError } = require("../utils/handleErrors");
const { ObjectId } = require("mongodb");
const vediosModel = require("../models/vedios.model");

module.exports.homePage = async (req, res, next) => {
  try {
    const Vedios = await Vedio.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userId",
        },
      },
      {
        $set: {
          userId: {
            $arrayElemAt: ["$userId", 0],
          },
        },
      },
      {
        $addFields: {
          userIdStr: {
            $toString: "$userId._id",
          },
        },
      },
      {
        $addFields: {
          vedioNamePath: {
            $concat: ["upload/", "$userIdStr", "/", "$vedioName"],
          },
          ImageCoverPath: {
            $concat: ["upload/", "$userIdStr", "/", "$ImageCoverName"],
          },
        },
      },
      {
        $project: {
          __v: 0,
          userIdStr: 0,
          userId: {
            vedios: 0,
            password: 0,
            verify: 0,
            createdAt: 0,
            updatedAt: 0,
            __v: 0,
          },
        },
      },
    ]);
    if (!Vedios) next(handleError(404, "not found vedios !!"));
    res.json({
      Vedios,
    });
  } catch (err) {
    next(handleError(400, "an error happened !"));
  }
};

module.exports.trend = async (req, res, next) => {
  try {
    let x = new Date();

    let z = x.getMonth() - 1;
    let b = x.setMonth(z);
    console.log(new Date(b));
    theVideo = await Vedio.find({
      createdAt: {
        $gte: new Date(b),
      },
    })
      .sort({ views: -1 })
      .limit(10);
    res.json(theVideo);
  } catch (err) {
    res.json(err);
  }
};

module.exports.randomVideo = async (req, res, next) => {
  try {
    let limit = parseInt(50);
    if (req.query.limit) limit = parseInt(req.query.limit);
    const randomVideos = await Vedio.aggregate([
      {
        $sample: { size: limit },
      },
    ]);
    res.status(200).json(randomVideos);
  } catch (err) {
    next(handleError(400, err.message, err.stack));
  }
};

module.exports.sub = async (req, res, next) => {
  try {
    const videosChannel = await vediosModel.aggregate([
      {
        $match: {
          userId: ObjectId(req.params.userId),
        },
      },
    ]);
    res.json(videosChannel);
  } catch (err) {
    res.json(err);
  }
};

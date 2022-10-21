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
    let theVideo = await Vedio.find({
      createdAt: {
        $gte: new Date(b),
      },
    })
      .sort({ views: -1 })
      .limit(10);
    if (!theVideo) next(handleError(404, "not found!!"));
    res.status(200).json(theVideo);
  } catch (err) {
    next(handleError(404, err.message, err.stack));
  }
};

module.exports.randomVideo = async (req, res, next) => {
  try {
    const randomVideos = await Vedio.aggregate([
      {
        $sample: { size: 50 },
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
    if (!videosChannel) next(handleError(404, "not found this channel !!"));
    res.json(videosChannel);
  } catch (err) {
    next(handleError(404, err.message, err.stack));
  }
};

module.exports.viewVideo = async (req, res, next) => {
  try {
    const theVideo = await Vedio.findOneAndUpdate(
      { _id: ObjectId(req.params.videoId) },
      {
        $inc: {
          views: 1,
        },
      },
      { new: true }
    );
    if (!theVideo) next(handleError(404, "not found this video !!"));
    res.status(200).json({ success: true, views: theVideo.views });
  } catch (err) {
    next(handleError(400, err.message, err.stack));
  }
};

module.exports.getByTags = async (req, res, next) => {
  try {
    console.log(req.query);
    let videos = await Vedio.find({
      tags: { $in: req.query },
    });
    if (!videos) next(handleError(404, "not found any video"));
    res.json(videos);
  } catch (err) {
    next(handleError(400, err.message, err.stack));
  }
};

module.exports.search = async (req, res, next) => {
  let query = Vedio.find();
  let channels = UsersModel.find();
  if (req.query.search !== null && req.query.search !== "") {
    query = query.regex("title", new RegExp(req.query.search, "i"));
    channels = channels.regex(`first_name`, new RegExp(req.query.search, "i"));
  }
  try {
    let Videos = await query.exec();
    let users = await channels.exec();
    res.json({
      Videos: Videos,
      users: users,
    });
  } catch (err) {
    next(handleError(400, err.message, err.stack));
  }
};

module.exports.like = async (req, res, next) => {
  try {
    let theUser = req.user._id;
    let theVideo = req.params.videoId;
    if (!theVideo) next(handleError(404, "not found this video !!"));
    theVideoAfterUpdate = await Vedio.findOneAndUpdate({
      theVideo: theVideo
    }, {
      $addToSet: {
        likes: theUser
      },
      $pull: {
        dislikes: theUser
      }
    },{new: true});
    res.status(200).json(theVideoAfterUpdate)
  } catch (err) {
    next(handleError(400,err.message,err.stack))
  }
};

module.exports.dislike = async (req, res, next) => {
  try {
    let theUser = req.user._id;
    let theVideo = req.params.videoId;
    if (!theVideo) next(handleError(404, "not found this video !!"));
    theVideoAfterUpdate = await Vedio.findOneAndUpdate(
      {
        theVideo: theVideo,
      },
      {
        $addToSet: {
          dislikes: theUser,
        },
        $pull: {
          likes: theUser,
        },
      },
      { new: true }
    );
    res.status(200).json(theVideoAfterUpdate);
  } catch (err) {
    next(handleError(400, err.message, err.stack));
  }
};

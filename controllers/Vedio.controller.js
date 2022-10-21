const Vedio = require("../models/vedios.model");
const {
  handleError,
  handleMessageErrorForVedio,
} = require("../utils/handleErrors");
const fs = require("fs");
const path = require("path");
const { ObjectId } = require("mongodb");
const UsersModel = require("../models/Users.model");

module.exports.AddVedio = async (req, res, next) => {
  try {
    await filterRequest(req, res, next);
    const Names = await NameFun(req.files);
    const newVedio = new Vedio({
      title: req.body.title,
      userId: req.user._id,
      vedioName: Names.vedioName,
      ImageCoverName: Names.imageName,
      category: req.body.category,
      views: req.body.views,
      tags: req.body.tags
    });
    await newVedio.save();
    await UsersModel.findByIdAndUpdate(req.user._id, {
      $push: {
        vedios: newVedio._id,
      },
    });
    res.json({
      newVedio,
      pathImage: newVedio.coverImagePath,
      pathVedio: newVedio.vedioNamePath,
    });
  } catch (err) {
    console.log(err);
    const handleErr = handleMessageErrorForVedio(err);
    next(handleError(400, handleErr));
  }
};

module.exports.showVedio = async (req, res, next) => {
  try {
    const theVedio = await Vedio.aggregate([
      {
        $match: {
          userId: ObjectId(req.query.userId),
          _id: ObjectId(req.query.vedioName),
        },
      },
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
    if (theVedio[0] == null) next(handleError(404, `not found this vedio `));
    res.json(theVedio);
  } catch (err) {
    next(handleError(400));
  }
};

module.exports.deleteVedio = async (req, res, next) => {
  try {
    const theVedio = await Vedio.findOneAndDelete(
      {
        _id: {
          $eq: req.params.VedioId,
        },
        userId: {
          $eq: req.user._id,
        },
      },
      {
        new: true,
      }
    );
    if (!theVedio) next(handleError(404, "not found this vedio"));
    await deleteVedioFun(theVedio.vedioNamePath, theVedio.coverImagePath);
    res.json(theVedio);
  } catch (err) {
    next(handleError(400, err.message));
  }
};

module.exports.updateCoverVedio = async (req, res, next) => {
  try {
    const theVideo = await Vedio.findOne({
      _id: req.params.videoId,
      userId: req.user._id,
    });
    if (!theVideo)
      next(handleError(400, "not found this video in database !!! "));
    console.log(theVideo);
    await deleteCoverImageFromUpload(theVideo.userId, theVideo.ImageCoverName);
    let UpdateVideo = await Vedio.findByIdAndUpdate(
      req.params.videoId,
      {
        $set: {
          ImageCoverName: req.file.filename,
        },
      },
      {
        new: true,
      }
    );
    res.status(200).json({ success: true, theVideo: UpdateVideo });
  } catch (err) {
    let path = `./upload/${req.user._id}/${req.file.filename}`;
    fs.access(path, (err) => {
      if (!err) {
        fs.unlink(path, (error) => {
          if (!error) {
            console.log("delete file");
          }
        });
      }
    });
    next(handleError(400, err.message, err.stack));
  }
};

module.exports.updateVedio = async (req, res, next) => {
  try {
    let UpdataVideo = await Vedio.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      {
        $set: {
          title: req.body.title,
          category: req.body.category,
        },
      },
      { new: true }
    );
    res.status(200).json(UpdataVideo);
  } catch (err) {
    next(handleError(400, err.message, err.stack));
  }
};

function NameFun(files) {
  const Names = {
    imageName: "",
    vedioName: "",
  };
  files.forEach((element) => {
    if (element.originalname.match(/\.(mp4)$/)) {
      Names["vedioName"] = element.filename;
    }
    if (element.originalname.match(/\.(jpg|jpeg|png)$/)) {
      Names["imageName"] = element.filename;
    }
  });
  return Names;
}

async function deleteVedioFun(pathImage, pathVedio) {
  pathImage = await path.join("./", pathImage);
  pathVedio = await path.join("./", pathVedio);
  fs.access(pathImage, (error) => {
    if (!error) {
      fs.unlink(pathImage, (err) => {
        if (err) {
          console.log("an error happened");
        } else {
          console.log("delete cover from server");
        }
      });
      fs.unlink(pathVedio, (err) => {
        if (err) {
          console.log("an error happened");
        } else {
          console.log("delete vedio from server");
        }
      });
    }
  });
}

async function deleteCoverImageFromUpload(userId, cover) {
  let path = `./upload/${userId}/${cover}`;
  fs.access(path, (error) => {
    if (!error) {
      fs.unlink(path, (error) => {
        if (!error) console.log(`delete file => ${path}`);
        else {
          console.log(`can not delete file => ${path}`);
        }
      });
    }
  });
}

function filterRequest(req, res, next) {
  if (req.files.length === 2) {
    req.files.forEach((e) => {
      if (!(e.mimetype.includes("image") || e.mimetype.includes("video"))) {
        next(handleError(400, "please input image, video file"));
      }
    });
  } else next(handleError(400, "please input image, video file"));
  if (Object.keys(req.body).length !== 4) {
    let list = {
      title: new String(),
      category: new String(),
      views: new Number(),
      tags: new Array(),
    };
    const ls = Object.getOwnPropertyNames(list);
    Object.entries(req.body).forEach(([key, value]) => {
      if (ls.includes(key)) {
        list[key] = value;
        console.log(key + `=>` + value + "\n");
      }
    });
    req.body = list;
  }
  req.query = null;
}

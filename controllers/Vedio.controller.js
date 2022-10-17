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
    const Names = await NameFun(req.files);
    const newVedio = new Vedio({
      title: req.body.title,
      userId: req.user._id,
      vedioName: Names.vedioName,
      ImageCoverName: Names.imageName,
      category: req.body.category,
      views: req.body.views
    });
    await newVedio.save();
    await UsersModel.findByIdAndUpdate(req.user._id, {
      $push: {
        vedios: newVedio._id
      }
    })
    res.json({
      newVedio,
      pathImage: newVedio.coverImagePath,
      pathVedio: newVedio.vedioNamePath,
    });
    res.json(newVedio);
  } catch (err) {
    const handleErr = handleMessageErrorForVedio(err);
    next(handleError(400, handleErr));
  }
};

module.exports.showVedio = async (req, res, next) => {
  try {
    const theVedio = await Vedio.aggregate([
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
    if (!theVedio) next(handleError(404, `not found this vedio `));
    console.log(theVedio.coverImagePath);
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

module.exports.updateVedio = async (req, res, next) => {
  try {
      let theVideo = await Vedio.findById(req.params.VideoId);
      if (req.file.mimetype.includes(''))
        res.json({
          theFile: req.file,
          theVideo,
        });
  } catch (err) {
    res.json(err);
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

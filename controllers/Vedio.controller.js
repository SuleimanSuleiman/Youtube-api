const Vedio = require('../models/vedios.model')
const {
    handleError,
    handleMessageErrorForVedio
} = require('../utils/handleErrors')
const fs = require('fs')

module.exports.AddVedio = async (req, res, next) => {
    try {
        const Names = await NameFun(req.files)
        const newVedio = new Vedio({
            title: req.body.title,
            userId: req.user._id,
            vedioName: Names.vedioName,
            ImageCoverName: Names.imageName,
            category: req.body.category,
        })
        await newVedio.save()
        res.json({
            newVedio,
            pathImage: newVedio.coverImagePath,
            pathVedio: newVedio.vedioNamePath
        })
        res.json(newVedio)
    } catch (err) {
        const handleErr = handleMessageErrorForVedio(err)
        next(handleError(400, handleErr))
    }
}



function NameFun(files) {
    const Names = {
        imageName: '',
        vedioName: ''
    }
    files.forEach(element => {
        if (element.originalname.match(/\.(mp4)$/)) {
            Names['vedioName'] = element.filename
        }
        if (element.originalname.match(/\.(jpg|jpeg|png)$/)) {
            Names['imageName'] = element.filename
        }
    });
    return Names
}
const fs = require('fs')

module.exports.CreateFolder = (id) => {
    const path = `./upload/${id}`
    fs.access(path, (error) => {
        if (error) {
            fs.mkdir(path, {
                recursive: true
            }, (error) => {
                if (error) {
                    console.log(error);
                } else {
                    console.log(`create new folder => ${id}`)
                }
            })
        } else {
            console.log("Given Directory already exists !!");
        }
    })
}

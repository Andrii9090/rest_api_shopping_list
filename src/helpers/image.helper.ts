import multer from "multer"

import config from "../config"
import logger from "../logger"

const filePath = config.imagePath


export const imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, filePath)
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
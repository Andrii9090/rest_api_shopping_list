import { Router } from "express";
import controller from "../controlllers/item.controller";
import isAutentificate from "../helpers/authenticate.helper";
import multer from "multer";
import path from "path";

const filePath = path.resolve(process.cwd(), 'public', 'uploads')


const imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, filePath)
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
})
const upload = multer({ storage: imageStorage })

const router = Router()

router.use(isAutentificate)

router.post('/:id', upload.single('image'), controller.saveImage.bind(controller))
router.get('/:id', controller.getImage.bind(controller))

export default router
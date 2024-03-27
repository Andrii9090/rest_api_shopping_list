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

router.post('/', controller.create.bind(controller))
router.post('/:id', controller.update.bind(controller))
router.delete('/:id', controller.delete.bind(controller))
router.get('/:list_id', controller.getAll.bind(controller)) // ?skip=0&take=10 fisrt how many objects skiped and second how many obj should be returnet. It's for pagination

export default router
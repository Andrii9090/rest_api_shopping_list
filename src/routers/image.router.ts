import express, { Router } from "express";
import controller from "../controlllers/item.controller";
import isAutentificate from "../helpers/authenticate.helper";
import multer from "multer";
import { imageStorage } from "../helpers/image.helper";


const upload = multer({ storage: imageStorage })

const router = Router()

router.use(isAutentificate)

router.get('/:id', controller.getImage.bind(controller))
router.post('/:id', upload.single('image'), controller.saveImage.bind(controller))
router.delete('/:id', controller.deleteImage.bind(controller))

export default router 
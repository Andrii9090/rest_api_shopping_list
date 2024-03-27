import { Router } from "express";
import listController from "../controlllers/list.controller";
import isAutentificate from "../helpers/authenticate.helper";

const router = Router()
router.use(isAutentificate)

router.post('/', listController.create.bind(listController))
router.post('/:id/add-user', listController.addUserToList.bind(listController))
router.post('/:id', listController.update.bind(listController))
router.delete('/:id', listController.delete.bind(listController))
router.get('/', listController.getAll.bind(listController)) // ?skip=0&take=10 fisrt how many objects skiped and second how many obj should be returnet. It's for pagination


export default router
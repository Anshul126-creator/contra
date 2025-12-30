import { Router } from "express";

import { getUserByIdHandler, listUsersHandler } from "../controllers/user.controller";

const router = Router();

router.get("/", listUsersHandler);
router.get("/:id", getUserByIdHandler);

export default router;

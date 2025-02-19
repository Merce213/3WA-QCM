import { Router } from "express";
import AuthController from "../controllers/AuthController";
import { validateData } from "../middlewares/validateData";
import { UserSignInSchema, UserSignUpSchema } from "../schemas/UserSchema";
import {
	authenticate,
	checkAuthorization,
} from "../middlewares/authMiddleware";

const router: Router = Router();

router.post(
	"/register",
	validateData(UserSignUpSchema),
	AuthController.register
);
router.post("/login", validateData(UserSignInSchema), AuthController.login);

router.get("/user/:id", AuthController.getUser);
router.put(
	"/user/:id",
	[authenticate, checkAuthorization()],
	AuthController.updateUser
);

export default router;

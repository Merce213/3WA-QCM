import { Router } from "express";
import AuthController from "../controllers/AuthController";
import AuthMiddleware from "../middlewares/authMiddleware";
import { validateData } from "../middlewares/validateData";
import { UserSignInSchema, UserSignUpSchema } from "../schemas/UserSchema";

const router: Router = Router();

router.post(
	"/register",
	[AuthMiddleware.checkNotAuthenticated, validateData(UserSignUpSchema)],
	AuthController.register
);
router.post(
	"/login",
	[AuthMiddleware.checkNotAuthenticated, validateData(UserSignInSchema)],
	AuthController.login
);
router.post("/logout", [AuthMiddleware.authenticate], AuthController.logout);
router.get("/me", [AuthMiddleware.authenticate], AuthController.me);

export default router;

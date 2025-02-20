import { Router } from "express";
import UserController from "../controllers/UserController";
import AuthMiddleware from "../middlewares/authMiddleware";
import { validateData } from "../middlewares/validateData";
import { UserUpdateSchema } from "../schemas/UserSchema";

const router: Router = Router();

router.get(
	"/",
	[
		AuthMiddleware.authenticate,
		AuthMiddleware.checkAuthorization(true, false),
	],
	UserController.getAllUsers
);
router.get(
	"/:id",
	[
		AuthMiddleware.authenticate,
		validateData(UserUpdateSchema),
		AuthMiddleware.checkAuthorization(),
	],
	UserController.getUserById
);
router.put(
	"/:id",
	[AuthMiddleware.authenticate, AuthMiddleware.checkAuthorization()],
	UserController.updateUser
);
router.delete(
	"/:id",
	[AuthMiddleware.authenticate, AuthMiddleware.checkAuthorization()],
	UserController.deleteUser
);

export default router;

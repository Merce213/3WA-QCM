import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/config";
import { UserRole } from "../types/User";

interface UserPayload {
	id: number;
	username: string;
	email: string;
	role: UserRole;
}

declare global {
	namespace Express {
		interface Request {
			user?: UserPayload;
		}
	}
}

export const authenticate = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const token = req.cookies?.token;

	if (!token) {
		res.status(401).json({ message: "Aucun token fourni" });
		return;
	}

	try {
		const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
		req.user = decoded;
		next();
	} catch (error) {
		res.status(401).json({ message: "Token invalide" });
		return;
	}
};

export const authorizeRole = (allowedRoles: UserRole[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		if (!req.user) {
			res.status(401).json({ message: "Non authentifié" });
			return;
		}

		const roleHierarchy = [UserRole.ADMIN, UserRole.CREATOR, UserRole.USER];
		const userRoleIndex = roleHierarchy.indexOf(req.user.role as UserRole);

		const isRoleAllowed = allowedRoles.some((role) => {
			const requiredRoleIndex = roleHierarchy.indexOf(role);
			return userRoleIndex <= requiredRoleIndex;
		});

		if (!isRoleAllowed) {
			res.status(403).json({ message: "Accès non autorisé" });
			return;
		}

		next();
	};
};

export const checkAuthorization = (requireAdmin = false, allowSelf = true) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			if (!req.user) {
				res.status(401).json({ message: "Non authentifié" });
				return;
			}

			const targetUserId = req.params.userId;
			const currentUserId = req.user.id.toString();
			const currentUserRole = req.user.role as UserRole;

			if (requireAdmin && currentUserRole !== UserRole.ADMIN) {
				res.status(403).json({ error: "Forbidden: Admin access only" });
				return;
			}

			if (
				allowSelf &&
				(!targetUserId || targetUserId === currentUserId)
			) {
				next();
				return;
			}

			if (currentUserRole === UserRole.ADMIN) {
				next();
				return;
			}

			res.status(403).json({
				error: "Forbidden: Insufficient permissions",
			});
			return;
		} catch (error) {
			console.error("Error in checkAuthorization middleware:", error);
			res.status(500).json({ error: "Internal server error" });
			return;
		}
	};
};

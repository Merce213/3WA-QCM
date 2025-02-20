import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ResultSetHeader } from "mysql2";
import MySQLAdapter from "../adapters/MySQLAdapter";
import { JWT_SECRET } from "../config/config";
import { UserRow } from "../types/User";

class AuthController {
	private static db = MySQLAdapter.getInstance();

	static async register(req: Request, res: Response) {
		try {
			const { username, email, password } = req.body;
			const hashedPassword = await bcrypt.hash(password, 10);

			const result = await AuthController.db.execute<ResultSetHeader>(
				"INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
				[username, email, hashedPassword]
			);

			res.status(201).json({
				message: "Utilisateur créé avec succès",
				userId: result.insertId,
			});
		} catch (error) {
			res.status(500).json({
				message: "Erreur lors de l'inscription",
				error,
			});
		}
	}

	static async login(req: Request, res: Response) {
		try {
			const { email, password } = req.body;

			const users = await AuthController.db.execute<UserRow[]>(
				"SELECT * FROM users WHERE email = ?",
				[email]
			);

			if (users.length === 0) {
				res.status(401).json({
					message: "Email ou mot de passe incorrect",
				});
				return;
			}

			const user = users[0];
			const isPasswordValid = await bcrypt.compare(
				password,
				user.password ?? ""
			);

			if (!isPasswordValid) {
				res.status(401).json({
					message: "Email ou mot de passe incorrect",
				});
				return;
			}

			const token = jwt.sign(
				{
					id: user.id,
					username: user.username,
					email: user.email,
					role: user.role,
				},
				JWT_SECRET,
				{ expiresIn: "1h" }
			);
			res.cookie("token", token, {
				httpOnly: true,
				expires: new Date(Date.now() + 3600000),
				sameSite:
					process.env.NODE_ENV === "production" ? "none" : "lax",
				secure: process.env.NODE_ENV === "production",
			});
			res.status(200).json({ message: "Connexion réussie" });
		} catch (error) {
			res.status(500).json({
				message: "Erreur lors de la connexion",
				error,
			});
		}
	}

	static async logout(req: Request, res: Response) {
		res.clearCookie("token", {
			httpOnly: true,
			sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
			secure: process.env.NODE_ENV === "production",
		});
		res.status(200).json({ message: "Déconnexion réussie" });
	}

	static async me(req: Request, res: Response) {
		try {
			const user = req.user;
			if (!user) {
				res.status(401).json({ message: "Non authentifié" });
				return;
			}
			res.status(200).json(user);
		} catch (error) {
			res.status(500).json({
				message: "Erreur lors de la récupération de vos informations",
				error,
			});
		}
	}
}

export default AuthController;

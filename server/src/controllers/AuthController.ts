import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2";
import MySQLAdapter from "../adapters/MySQLAdapter";
import { JWT_SECRET } from "../config/config";

interface UserRow extends RowDataPacket {
	id: number;
	username: string;
	email: string;
	password?: string;
	role: string;
}

class AuthController {
	private static db = MySQLAdapter.getInstance();

	static async register(req: Request, res: Response) {
		try {
			const { username, email, password } = req.body;
			const hashedPassword = await bcrypt.hash(password, 10);

			const result = await AuthController.db.execute(
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

			const users = await AuthController.db.query<UserRow[]>(
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
					userId: user.id,
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
			res.json({ message: "Connexion réussie" });
		} catch (error) {
			res.status(500).json({
				message: "Erreur lors de la connexion",
				error,
			});
		}
	}

	static async getUser(req: Request, res: Response) {
		try {
			const userId = req.params.id;
			const user = await AuthController.db.query<UserRow[]>(
				"SELECT id, username, email, role, created_at FROM users WHERE id = ?",
				[userId]
			);

			if (user.length === 0) {
				res.status(404).json({
					message: "Utilisateur non trouvé",
				});
				return;
			}
			res.json(user[0]);
		} catch (error) {
			res.status(500).json({
				message: "Erreur lors de la récupération de l'utilisateur",
				error,
			});
		}
	}

	static async updateUser(req: Request, res: Response) {
		try {
			const userId = req.params.id;
			const { username, email, password } = req.body;

			await AuthController.db.execute(
				"UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?",
				[username, email, password, userId]
			);

			res.json({ message: "Utilisateur mis à jour avec succès" });
		} catch (error) {
			res.status(500).json({
				message: "Erreur lors de la mise à jour de l'utilisateur",
				error,
			});
		}
	}
}

export default AuthController;

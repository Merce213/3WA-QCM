import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { ResultSetHeader } from "mysql2";
import MySQLAdapter from "../adapters/MySQLAdapter";
import { UserRow } from "../types/User";

class UserController {
	private static db = MySQLAdapter.getInstance();

	static async getAllUsers(req: Request, res: Response) {
		try {
			const users = await UserController.db.query<UserRow[]>(
				"SELECT id, username, email, role, created_at, updated_at FROM users"
			);

			if (users.length === 0) {
				res.status(404).json({ message: "Aucun utilisateur trouvé" });
				return;
			}

			res.status(200).json(users);
		} catch (error) {
			res.status(500).json({
				message: "Erreur lors de la récupération des utilisateurs",
				error,
			});
		}
	}

	static async getUserById(req: Request, res: Response) {
		try {
			const userId = req.params.id;
			const user = await UserController.db.query<UserRow[]>(
				"SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = ?",
				[userId]
			);

			if (user.length === 0) {
				res.status(404).json({
					message: "Utilisateur non trouvé",
				});
				return;
			}
			res.status(200).json(user[0]);
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
			const { username, email, oldPassword, newPassword, role } =
				req.body;

			const users = await UserController.db.query<UserRow[]>(
				"SELECT * FROM users WHERE id = ?",
				[userId]
			);

			if (users.length === 0) {
				res.status(404).json({ message: "Utilisateur non trouvé" });
				return;
			}

			const user = users[0];
			const updates: string[] = [];
			const values: any[] = [];

			if (username && username !== user.username) {
				const [existingUser] = await UserController.db.query<UserRow[]>(
					"SELECT * FROM users WHERE username = ?",
					[username]
				);

				if (existingUser) {
					res.status(400).json({
						message: "Nom d'utilisateur déjà utilisé",
					});
					return;
				}

				updates.push("username = ?");
				values.push(username);
			}

			if (email && email !== user.email) {
				const [existingUser] = await UserController.db.query<UserRow[]>(
					"SELECT * FROM users WHERE email = ?",
					[email]
				);

				if (existingUser) {
					res.status(400).json({ message: "Email déjà utilisé" });
					return;
				}

				updates.push("email = ?");
				values.push(email);
			}

			if (oldPassword && newPassword) {
				const isPasswordValid = await bcrypt.compare(
					oldPassword,
					user.password
				);

				if (!isPasswordValid) {
					res.status(401).json({
						message: "L'ancien mot de passe est incorrect",
					});
					return;
				}

				const hashedPassword = await bcrypt.hash(newPassword, 10);
				updates.push("password = ?");
				values.push(hashedPassword);
			}

			if (role !== undefined && role !== user.role) {
				updates.push("role = ?");
				values.push(role);
			}

			if (updates.length > 0) {
				const query = `UPDATE users SET ${updates.join(
					", "
				)} WHERE id = ?`;
				values.push(userId);
				await UserController.db.execute(query, values);
				res.status(200).json({
					message: "Utilisateur mis à jour avec succès",
				});
			} else {
				res.status(200).json({
					message: "Aucune modification apportée",
				});
			}
		} catch (error) {
			res.status(500).json({
				message: "Erreur lors de la mise à jour de l'utilisateur",
				error,
			});
		}
	}

	static async deleteUser(req: Request, res: Response) {
		try {
			const userId = req.params.id;
			const result = await UserController.db.execute<ResultSetHeader>(
				"DELETE FROM users WHERE id = ?",
				[userId]
			);

			if (result.affectedRows === 0) {
				res.status(404).json({
					message: "Utilisateur non trouvé",
				});
				return;
			}

			res.status(200).json({
				message: "Utilisateur supprimé avec succès",
			});
		} catch (error) {
			res.status(500).json({
				message: "Erreur lors de la suppression de l'utilisateur",
				error,
			});
		}
	}
}

export default UserController;

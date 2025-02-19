// src/controllers/QuizController.ts

import { Request, Response } from "express";
import { RowDataPacket } from "mysql2";
import MySQLAdapter from "../adapters/MySQLAdapter";

interface QuizRow extends RowDataPacket {
	id: number;
	title: string;
	description: string | null;
	creator_id: number;
	created_at: Date;
	updated_at: Date;
}

export class QuizController {
	private static db = MySQLAdapter.getInstance();

	static async getAll(req: Request, res: Response) {
		try {
			const quizzes = await QuizController.db.query<QuizRow[]>(
				"SELECT * FROM quizzes"
			);
			res.json(quizzes);
		} catch (error) {
			console.error("Erreur lors de la récupération des quiz:", error);
			res.status(500).json({
				message: "Erreur lors de la récupération des quiz",
			});
		}
	}

	static async getById(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const quiz = await QuizController.db.query<QuizRow[]>(
				"SELECT * FROM quizzes WHERE id = ?",
				[id]
			);
			res.json(quiz[0]);
		} catch (error) {
			console.error("Erreur lors de la récupération du quiz:", error);
			res.status(500).json({
				message: "Erreur lors de la récupération du quiz",
			});
		}
	}

	static async create(req: Request, res: Response) {
		try {
			const { title, description } = req.body;
			const creatorId = req.user?.id;

			if (!creatorId) {
				return res.status(401).json({
					message: "Utilisateur non authentifié",
				});
			}

			const result = await QuizController.db.execute(
				"INSERT INTO quizzes (title, description, creator_id) VALUES (?, ?, ?)",
				[title, description, creatorId]
			);

			res.status(201).json({
				message: "Quiz créé avec succès",
			});
		} catch (error) {
			console.error("Erreur lors de la création du quiz:", error);
			res.status(500).json({
				message: "Erreur lors de la création du quiz",
			});
		}
	}
	static async update(req: Request, res: Response) {
		try {
			const { quizId } = req.params;
			const { title, description } = req.body;
			const userId = req.user?.id;

			const result = await QuizController.db.execute(
				"UPDATE quizzes SET title = ?, description = ? WHERE id = ? AND creator_id = ?",
				[title, description, quizId, userId]
			);

			if (result.affectedRows === 0) {
				return res.status(404).json({
					message: "Quiz non trouvé ou non autorisé à modifier",
				});
			}

			res.json({ quizId, title, description });
		} catch (error) {
			console.error("Erreur lors de la mise à jour du quiz:", error);
			res.status(500).json({
				message: "Erreur lors de la mise à jour du quiz",
			});
		}
	}

	static async delete(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const userId = req.user?.id;

			const result = await QuizController.db.execute(
				"DELETE FROM quizzes WHERE id = ? AND creator_id = ?",
				[id, userId]
			);

			if (result.affectedRows === 0) {
				return res.status(404).json({
					message: "Quiz non trouvé ou non autorisé à supprimer",
				});
			}

			res.json({ message: "Quiz supprimé avec succès" });
		} catch (error) {
			console.error("Erreur lors de la suppression du quiz:", error);
			res.status(500).json({
				message: "Erreur lors de la suppression du quiz",
			});
		}
	}
}

import { z } from "zod";
import { UserRole } from "../types/User";

export const UserSignUpSchema = z.object({
	body: z
		.object({
			username: z
				.string({
					required_error: "Le nom d'utilisateur est requis",
				})
				.min(
					4,
					"Le nom d'utilisateur doit contenir au moins 4 caractères"
				)
				.max(
					20,
					"Le nom d'utilisateur doit contenir au maximum 20 caractères"
				)
				.regex(
					/^[A-Za-z0-9_]+$/,
					"Le nom d'utilisateur ne peut contenir que des lettres, chiffres et underscores"
				)
				.trim()
				.refine((val) => val.trim().length > 0, {
					message: "Le nom d'utilisateur ne peut pas être vide",
				}),
			email: z
				.string({ required_error: "L'email est requis" })
				.email("Format d'email invalide")
				.trim(),
			password: z
				.string({ required_error: "Le mot de passe est requis" })
				.min(5, "Le mot de passe doit contenir au moins 5 caractères")
				.trim(),
			confirmPassword: z.string({
				required_error: "Veuillez confirmer votre mot de passe",
			}),
			role: z.nativeEnum(UserRole).default(UserRole.USER),
		})
		.refine((data) => data.password === data.confirmPassword, {
			message: "Les mots de passe ne correspondent pas",
			path: ["confirmPassword"],
		}),
});

export const UserSignInSchema = z.object({
	body: z.object({
		email: z
			.string({ required_error: "L'email est requis" })
			.email("Format d'email invalide")
			.trim(),
		password: z
			.string({ required_error: "Le mot de passe est requis" })
			.min(5, "Le mot de passe doit contenir au moins 5 caractères")
			.trim(),
	}),
});

export const UserUpdateSchema = z.object({
	params: z.object({
		id: z.string({
			required_error: "L'identifiant de l'utilisateur est requis",
		}),
	}),
	body: z.object({
		username: z
			.string({
				required_error: "Le nom d'utilisateur est requis",
			})
			.min(4, "Le nom d'utilisateur doit contenir au moins 4 caractères")
			.max(
				20,
				"Le nom d'utilisateur doit contenir au maximum 20 caractères"
			)
			.regex(
				/^[A-Za-z0-9_]+$/,
				"Le nom d'utilisateur ne peut contenir que des lettres, chiffres et underscores"
			)
			.trim()
			.refine((val) => val.trim().length > 0, {
				message: "Le nom d'utilisateur ne peut pas être vide",
			})
			.optional(),
		email: z
			.string({ required_error: "L'email est requis" })
			.email("Format d'email invalide")
			.trim()
			.optional(),
		oldPassword: z.string().optional(),
		newPassword: z
			.string()
			.min(5, "Le mot de passe doit contenir au moins 5 caractères")
			.trim()
			.optional(),
		role: z.nativeEnum(UserRole).default(UserRole.USER),
	}),
});

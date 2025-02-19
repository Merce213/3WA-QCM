import { NextFunction, Request, Response } from "express";
import { ZodError, ZodSchema } from "zod";

export const validateData =
	(schema: ZodSchema) =>
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const validatedData = await schema.parseAsync({
				body: req.body,
				query: req.query,
				params: req.params,
			});

			req.body = validatedData.body || req.body;
			req.query = validatedData.query || req.query;
			req.params = validatedData.params || req.params;

			next();
		} catch (error) {
			if (error instanceof ZodError) {
				const errorMessages = Object.fromEntries(
					error.errors.map((issue) => [issue.path[1], issue.message])
				);

				res.status(400).json({
					errors: errorMessages,
				});
			} else {
				console.error("Unexpected error:", error);
				res.status(500).json({
					error: "Internal Server Error",
				});
			}
		}
	};

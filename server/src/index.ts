import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { Application } from "express";
import authRoutes from "./routes/AuthRoute";
import { PORT } from "./config/config";

dotenv.config();

const app: Application = express();

app.use(
	cors({
		origin: ["http://localhost:5173"],
		credentials: true,
	})
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
	console.log(`[server]: Server is running at http://localhost:${PORT}`);
});

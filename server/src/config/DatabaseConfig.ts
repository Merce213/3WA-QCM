import dotenv from "dotenv";

dotenv.config();

export class DatabaseConfig {
	private config: any;

	constructor() {
		this.config = {
			host: process.env.DB_HOST || "localhost",
			user: process.env.DB_USER || "root",
			password: process.env.DB_PASS || "",
			database: process.env.DB_NAME || "qcm_app",
			waitForConnections: true,
			connectionLimit: 10,
			queueLimit: 0,
		};
	}

	getConfig(): any {
		return this.config;
	}
}

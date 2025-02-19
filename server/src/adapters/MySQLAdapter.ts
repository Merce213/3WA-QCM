import mysql, {
	Pool,
	RowDataPacket,
	ResultSetHeader,
	ProcedureCallPacket,
} from "mysql2/promise";
import { DatabaseConfig } from "../config/DatabaseConfig";

type QueryResult =
	| RowDataPacket[]
	| RowDataPacket[][]
	| ResultSetHeader
	| ResultSetHeader[]
	| ProcedureCallPacket;

class MySQLAdapter {
	private static instance: MySQLAdapter;
	private pool: Pool;

	private constructor() {
		const dbConfig = new DatabaseConfig();
		this.pool = mysql.createPool(dbConfig.getConfig());
	}

	public static getInstance(): MySQLAdapter {
		if (!MySQLAdapter.instance) {
			MySQLAdapter.instance = new MySQLAdapter();
		}
		return MySQLAdapter.instance;
	}

	public async query<T extends QueryResult>(
		sql: string,
		params?: any[]
	): Promise<T> {
		const [rows] = await this.pool.query<T>(sql, params);
		return rows;
	}

	public async execute(
		sql: string,
		params?: any[]
	): Promise<ResultSetHeader> {
		const [result] = await this.pool.execute<ResultSetHeader>(sql, params);
		return result;
	}

	/* public async close(): Promise<void> {
		await this.pool.end();
	} */
}

export default MySQLAdapter;

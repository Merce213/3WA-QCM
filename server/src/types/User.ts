import { RowDataPacket } from "mysql2";

export enum UserRole {
	USER = "user",
	CREATOR = "creator",
	ADMIN = "admin",
}

export interface User {
	id: number;
	username: string;
	email: string;
	password: string;
	role: UserRole;
	created_at: Date;
	updated_at: Date;
}

export interface UserRow extends User, RowDataPacket {}

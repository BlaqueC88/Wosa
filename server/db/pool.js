import pg from "pg";
import { env } from "../config/env.js";

const { Pool }=pg;

export const pool=new Pool({
	user: env.DB_USER,
	password: env.DB_PASSWORD,
	database: env.DB_NAME,

	/*
		On Termux, this is the directory containing:
		.s.PGSQL.5432
	*/
	host: env.DB_SOCKET_DIR??env.DB_HOST,

	port: env.DB_PORT,
	ssl: false,

	max: 10,
	idleTimeoutMillis: 30_000,
	connectionTimeoutMillis: 5_000,
});

pool.on("error",(error) => {
	console.error("Unexpected PostgreSQL pool error:",error);
});
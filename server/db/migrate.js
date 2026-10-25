import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { pool } from "./pool.js";

const migrationsDir=path.join(
	path.dirname(fileURLToPath(import.meta.url)),
	"migrations"
);

async function run() {
	await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

	const applied=await pool.query("SELECT filename FROM schema_migrations");
	const appliedNames=new Set(applied.rows.map((row) => row.filename));

	const files=(await fs.readdir(migrationsDir))
		.filter((name) => name.endsWith(".sql"))
		.sort();

	for(const file of files) {
		if(appliedNames.has(file)) {
			continue;
		}

		const sql=await fs.readFile(path.join(migrationsDir,file),"utf8");
		const client=await pool.connect();

		try {
			await client.query("BEGIN");
			await client.query(sql);
			await client.query(
				"INSERT INTO schema_migrations (filename) VALUES ($1)",
				[file]
			);
			await client.query("COMMIT");

			console.log(`Applied: ${file}`);
		} catch(error) {
			await client.query("ROLLBACK");
			console.error(`Failed: ${file}`);
			throw error;
		} finally {
			client.release();
		}
	}

	console.log("Migrations up to date.");
}

try {
	await run();
} finally {
	await pool.end();
}
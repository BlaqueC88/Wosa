import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { pool } from "./pool.js";

const publicDir=path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"../../client/public"
);

try {
	const result=await pool.query(
		"SELECT slug, image_url FROM menu_items ORDER BY slug"
	);

	const missing=result.rows.filter(
		(row) => !fs.existsSync(path.join(publicDir,row.image_url))
	);

	if(missing.length===0) {
		console.log(`All ${result.rows.length} image paths point to real files.`);
	} else {
		console.table(missing);
	}
} finally {
	await pool.end();
}
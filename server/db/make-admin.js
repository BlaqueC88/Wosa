import { pool } from "./pool.js";

const email=process.argv[2]?.trim().toLowerCase();

if(!email) {
	console.error("Usage: node db/make-admin.js you@example.com");
	process.exit(1);
}

try {
	const result=await pool.query(
		`
      UPDATE users
      SET role = 'admin', updated_at = NOW()
      WHERE LOWER(email) = $1
      RETURNING email, role
    `,
		[email]
	);

	if(result.rowCount===0) {
		console.log("No user found with that email.");
	} else {
		console.table(result.rows);
	}
} finally {
	await pool.end();
}
import { pool } from "./pool.js";

const action=process.argv[2];

// Database names cannot be passed as $1 placeholders, only values can.
// This name is a fixed constant, never user input, so it is safe here.
const name="wosa_scratch";

try {
	if(action==="create") {
		await pool.query(`CREATE DATABASE ${name}`);
		console.log(`Created ${name}`);
	} else if(action==="drop") {
		await pool.query(`DROP DATABASE IF EXISTS ${name}`);
		console.log(`Dropped ${name}`);
	} else {
		console.log("Usage: node db/scratch-db.js create|drop");
	}
} finally {
	await pool.end();
}
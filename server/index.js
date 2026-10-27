import "dotenv/config";

import compression from "compression";
import connectPgSimple from "connect-pg-simple";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import session from "express-session";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env.js";
import { pool } from "./db/pool.js";
import authRouter from "./routes/auth.routes.js";
import menuRouter from "./routes/menu.routes.js";
import adminRouter from "./routes/admin.routes.js";
import ordersRouter from "./routes/orders.routes.js";
import wishlistRouter from "./routes/wishlist.routes.js";

const app=express();
const PgSessionStore=connectPgSimple(session);

const isProduction=env.NODE_ENV==="production";

const sessionMaxAge=
	Number(process.env.SESSION_MAX_AGE_MS)||
	1000*60*60*24*7;

const allowedOrigins=new Set(
	[
		process.env.CLIENT_ORIGIN,
		"http://localhost:5173",
		"http://localhost:5174",
	].filter(Boolean)
);

app.disable("x-powered-by");

/*
	Needed when the production app is deployed behind a reverse proxy
	that terminates HTTPS. It is harmless in local Termux development.
*/
app.set("trust proxy",1);

app.use(helmet());

app.use(
	cors({
		origin(origin,callback) {
			/*
				curl and Postman normally have no Origin header.
				Allow them during local development so you can test API endpoints.

				Browser requests must match one of the approved frontend origins.
			*/
			if(!origin||allowedOrigins.has(origin)) {
				return callback(null,true);
			}

			return callback(
				new Error(`CORS blocked for origin: ${origin}`)
			);
		},

		credentials: true,

		methods: ["GET","POST","PATCH","PUT","DELETE","OPTIONS"],

		allowedHeaders: ["Content-Type","Authorization"],
	})
);

app.use(compression());
app.use(morgan("dev"));

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false }));

/*
	Express-session does not require cookie-parser, but keeping this is fine
	if other current or future routes use req.cookies.
*/
app.use(cookieParser());

/*
	Session data is stored in PostgreSQL's public.session table.

	The browser receives only a signed, HttpOnly session-id cookie:
	wosa_session=<session id>

	The cookie does NOT contain:
	- user details
	- user role
	- password hash
	- password
*/
app.use(
	session({
		store: new PgSessionStore({
			pool,
			tableName: "session",
			createTableIfMissing: true,
			pruneSessionInterval: 60*15,
		}),

		name: process.env.SESSION_NAME||"wosa_session",

		secret: process.env.SESSION_SECRET,

		resave: false,
		saveUninitialized: false,

		rolling: true,

		cookie: {
			httpOnly: true,
			secure:
				process.env.COOKIE_SECURE==="true"||isProduction,
			sameSite: process.env.COOKIE_SAME_SITE||"lax",
			maxAge: sessionMaxAge,
		},
	})
);

app.get("/api/health",async (_req,res,next) => {
	try {
		const result=await pool.query(
			"SELECT current_database() AS database, current_user AS user"
		);

		return res.status(200).json({
			message: "Wosa API is running.",
			database: result.rows[0],
		});
	} catch(error) {
		return next(error);
	}
});

app.use("/api/auth",authRouter);

app.use("/api/menu",menuRouter);

app.use("/api/admin",adminRouter);

app.use("/api/orders",ordersRouter);

app.use("/api/wishlist",wishlistRouter);

app.use((req,res) => {
	return res.status(404).json({
		message: `Route not found: ${req.method} ${req.originalUrl}`,
	});
});

app.use((error,req,res,_next) => {
	console.error("\n========== WOSA API ERROR ==========");
	console.error("Request:",`${req.method} ${req.originalUrl}`);
	console.error("Message:",error.message);
	console.error("Code:",error.code??"none");
	console.error("Stack:",error.stack);
	console.error("===========================================\n");

	return res.status(error.statusCode||500).json({
		message: "Internal server error.",

		...(env.NODE_ENV==="development"
			? {
				debug: {
					message: error.message,
					code: error.code??null,
				},
			}
			:{}),
	});
});

app.listen(env.PORT,() => {
	console.log(
		`Wosa API running on http://localhost:${env.PORT}`
	);
});
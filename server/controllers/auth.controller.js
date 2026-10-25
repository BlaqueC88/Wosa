import bcrypt from "bcryptjs";

import { pool } from "../db/pool.js";

const BCRYPT_ROUNDS = 12;

function toSafeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.created_at,
  };
}

function regenerateSession(req) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

function saveSession(req) {
  return new Promise((resolve, reject) => {
    req.session.save((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

export async function signup(req, res, next) {
  try {
    const { name, email, password } = req.validatedBody;

    const existingUserResult = await pool.query(
      `
        SELECT id
        FROM users
        WHERE LOWER(email) = LOWER($1)
        LIMIT 1
      `,
      [email]
    );

    if (existingUserResult.rowCount > 0) {
      return res.status(409).json({
        message: "An account with that email address already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const result = await pool.query(
      `
        INSERT INTO users (
          name,
          email,
          password_hash,
          role
        )
        VALUES ($1, $2, $3, 'customer')
        RETURNING id, name, email, role, created_at
      `,
      [name, email, passwordHash]
    );

    const user = toSafeUser(result.rows[0]);

    await regenerateSession(req);

    req.session.userId = user.id;

    await saveSession(req);

    return res.status(201).json({
      message: "Account created.",
      user,
    });
  } catch (error) {
    return next(error);
  }
}

export async function signin(req, res, next) {
  try {
    const { email, password } = req.validatedBody;

    const result = await pool.query(
      `
        SELECT
          id,
          name,
          email,
          password_hash,
          role,
          created_at
        FROM users
        WHERE LOWER(email) = LOWER($1)
        LIMIT 1
      `,
      [email]
    );

    const user = result.rows[0];

    /*
      Use the same response whether the email is unknown or the password
      is incorrect. Do not reveal which part failed.
    */
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    await regenerateSession(req);

    req.session.userId = user.id;

    await saveSession(req);

    return res.status(200).json({
      message: "Signed in.",
      user: toSafeUser(user),
    });
  } catch (error) {
    return next(error);
  }
}

export async function signout(req, res, next) {
  try {
    if (!req.session) {
      return res.status(204).end();
    }

    req.session.destroy((error) => {
      if (error) {
        return next(error);
      }

      res.clearCookie(
        process.env.SESSION_NAME || "gabz_meals_session",
        {
          httpOnly: true,
          secure: process.env.COOKIE_SECURE === "true",
          sameSite: process.env.COOKIE_SAME_SITE || "lax",
        }
      );

      return res.status(204).end();
    });
  } catch (error) {
    return next(error);
  }
}

export async function me(req, res) {
  return res.status(200).json({
    user: req.user,
  });
}

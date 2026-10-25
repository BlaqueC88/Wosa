import bcrypt from "bcrypt";

import pool from "../config/db.js";

const BCRYPT_ROUNDS = 12;

function toSafeUser(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
  };
}

function createSession(req, userId) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((regenerateError) => {
      if (regenerateError) {
        reject(regenerateError);
        return;
      }

      req.session.userId = userId;

      req.session.save((saveError) => {
        if (saveError) {
          reject(saveError);
          return;
        }

        resolve();
      });
    });
  });
}

export async function signup(req, res, next) {
  try {
    const { fullName, email, password } = req.validatedBody;

    const existingUserResult = await pool.query(
      `
        SELECT id
        FROM users
        WHERE email = $1
        LIMIT 1
      `,
      [email]
    );

    if (existingUserResult.rowCount > 0) {
      return res.status(409).json({
        error: "An account with that email address already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const result = await pool.query(
      `
        INSERT INTO users (
          full_name,
          email,
          password_hash,
          role
        )
        VALUES ($1, $2, $3, 'user')
        RETURNING id, full_name, email, role, created_at
      `,
      [fullName, email, passwordHash]
    );

    const user = toSafeUser(result.rows[0]);

    await createSession(req, user.id);

    return res.status(201).json({
      message: "Account created.",
      user,
    });
  } catch (error) {
    next(error);
  }
}

export async function signin(req, res, next) {
  try {
    const { email, password } = req.validatedBody;

    const result = await pool.query(
      `
        SELECT
          id,
          full_name,
          email,
          password_hash,
          role,
          created_at
        FROM users
        WHERE email = $1
        LIMIT 1
      `,
      [email]
    );

    const userRow = result.rows[0];

    /*
      Generic response prevents revealing whether a particular email exists.
    */
    if (!userRow) {
      return res.status(401).json({
        error: "Invalid email or password.",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      userRow.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        error: "Invalid email or password.",
      });
    }

    await createSession(req, userRow.id);

    return res.status(200).json({
      message: "Signed in.",
      user: toSafeUser(userRow),
    });
  } catch (error) {
    next(error);
  }
}

export async function signout(req, res, next) {
  try {
    if (!req.session) {
      return res.status(204).end();
    }

    req.session.destroy((error) => {
      if (error) {
        next(error);
        return;
      }

      res.clearCookie("gabz.sid", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });

      res.status(204).end();
    });
  } catch (error) {
    next(error);
  }
}

export async function me(req, res) {
  return res.status(200).json({
    user: req.user,
  });
}
import { pool } from "../db/pool.js";

function toSafeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.created_at,
  };
}

export async function requireAuth(req, res, next) {
  try {
    const userId = req.session?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    const result = await pool.query(
      `
        SELECT
          id,
          name,
          email,
          role,
          created_at
        FROM users
        WHERE id = $1
        LIMIT 1
      `,
      [userId]
    );

    const user = result.rows[0];

    /*
      The session may reference an account that was deleted directly
      from PostgreSQL. Destroy that invalid session rather than keeping it.
    */
    if (!user) {
      req.session.destroy(() => {});

      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    req.user = toSafeUser(user);

    return next();
  } catch (error) {
    return next(error);
  }
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You do not have permission to perform this action.",
      });
    }

    return next();
  };
}

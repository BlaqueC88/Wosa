import pool from "../config/db.js";

function toSafeUser(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
  };
}

export async function requireAuth(req, res, next) {
  try {
    const userId = req.session?.userId;

    if (!userId) {
      return res.status(401).json({
        error: "Authentication required.",
      });
    }

    const result = await pool.query(
      `
        SELECT id, full_name, email, role, created_at
        FROM users
        WHERE id = $1
        LIMIT 1
      `,
      [userId]
    );

    const userRow = result.rows[0];

    if (!userRow) {
      req.session.destroy(() => {});

      return res.status(401).json({
        error: "Authentication required.",
      });
    }

    req.user = toSafeUser(userRow);
    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication required.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: "You do not have permission to perform this action.",
      });
    }

    next();
  };
}
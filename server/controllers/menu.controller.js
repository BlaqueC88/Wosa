import Joi from "joi";
import { pool } from "../db/pool.js";

const categories=[
	"steaks",
	"chicken",
	"fish",
	"surfnturf",
	"salads",
	"desserts",
];

const categorySchema=Joi.string()
	.trim()
	.lowercase()
	.valid(...categories)
	.required();

const menuItemParamsSchema=Joi.object({
	category: Joi.string()
		.trim()
		.lowercase()
		.valid(...categories)
		.required(),

	slug: Joi.string()
		.trim()
		.lowercase()
		.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
		.max(120)
		.required(),
});

function serializeMenuItem(row) {
	return {
		id: row.id,
		slug: row.slug,
		name: row.name,
		description: row.description,
		category: row.category,

		// Convert PostgreSQL snake_case to client-friendly camelCase.
		priceCents: row.price_cents,
		imageUrl: row.image_url,

		available: row.available,
		featured: row.featured,
		prepTimeMinutes: row.prep_time_minutes,
	};
}

async function getOptionGroupsForMenuItem(menuItemId) {
	const result=await pool.query(
		`
      SELECT
        g.code AS group_code,
        g.name AS group_name,
        g.required,
        c.code AS choice_code,
        c.name AS choice_name,
        c.price_adjustment_cents,
        c.is_default
      FROM menu_item_option_groups mog
      JOIN option_groups g ON g.id = mog.option_group_id
      JOIN option_choices c ON c.group_id = g.id
      WHERE mog.menu_item_id = $1
      ORDER BY mog.sort_order, c.sort_order
    `,
		[menuItemId]
	);

	const groupsByCode=new Map();

	for(const row of result.rows) {
		if(!groupsByCode.has(row.group_code)) {
			groupsByCode.set(row.group_code,{
				code: row.group_code,
				name: row.group_name,
				required: row.required,
				choices: [],
			});
		}

		groupsByCode.get(row.group_code).choices.push({
			code: row.choice_code,
			name: row.choice_name,
			priceAdjustmentCents: row.price_adjustment_cents,
			isDefault: row.is_default,
		});
	}

	return [...groupsByCode.values()];
}

/*
	GET /api/menu/featured

	Used by:
	client/app/routes/_index.tsx
*/
export async function getFeaturedMenuItems(_req,res,next) {
	try {
		const result=await pool.query(`
      SELECT
        id,
        slug,
        name,
        description,
        category,
        price_cents,
        image_url,
        available,
        featured,
        prep_time_minutes
      FROM menu_items
      WHERE available = TRUE
        AND featured = TRUE
      ORDER BY created_at DESC
      LIMIT 6
    `);

		return res.status(200).json({
			data: result.rows.map(serializeMenuItem),
		});
	} catch(error) {
		return next(error);
	}
}

/*
	GET /api/menu?category=steaks

	Used by:
	client/app/routes/steaks/route.tsx
*/
export async function getMenuItemsByCategory(req,res,next) {
	try {
		const { error,value: category }=categorySchema.validate(
			req.query.category
		);

		if(error) {
			return res.status(400).json({
				message: "Choose a valid menu category.",
				errors: error.details.map((detail) => detail.message),
			});
		}

		const result=await pool.query(
			`
        SELECT
          id,
          slug,
          name,
          description,
          category,
          price_cents,
          image_url,
          available,
          featured,
          prep_time_minutes
        FROM menu_items
        WHERE category = $1
          AND available = TRUE
        ORDER BY featured DESC, name ASC
      `,
			[category]
		);

		return res.status(200).json({
			category,
			data: result.rows.map(serializeMenuItem),
		});
	} catch(error) {
		return next(error);
	}
}

/*
	GET /api/menu/:category/:slug

	Examples:
	GET /api/menu/steaks/ribeye-300g
	GET /api/menu/chicken/flame-grilled-chicken
*/
export async function getMenuItemByCategoryAndSlug(req,res,next) {
	try {
		const { error,value }=menuItemParamsSchema.validate(req.params,{
			abortEarly: false,
			stripUnknown: true,
		});

		if(error) {
			return res.status(400).json({
				message: "Invalid menu item path.",
				errors: error.details.map((detail) => detail.message),
			});
		}

		const result=await pool.query(
			`
        SELECT
          id,
          slug,
          name,
          description,
          category,
          price_cents,
          image_url,
          available,
          featured,
          prep_time_minutes
        FROM menu_items
        WHERE category = $1
          AND slug = $2
          AND available = TRUE
        LIMIT 1
      `,
			[value.category,value.slug]
		);

		const item=result.rows[0];

		if(!item) {
			return res.status(404).json({
				message: "Menu item not found.",
			});
		}

		const optionGroups=await getOptionGroupsForMenuItem(item.id);

		return res.status(200).json({
			data: {
				...serializeMenuItem(item),
				optionGroups,
			},
		});
	} catch(error) {
		return next(error);
	}
}
/*
  GET /api/menu/search?q=ribeye
*/
export async function searchMenuItems(req, res, next) {
  try {
    const text =
      typeof req.query.q === "string" ? req.query.q.trim().slice(0, 60) : "";

    if (text.length < 2) {
      return res.status(200).json({ data: [] });
    }

    // Escape the characters that have a special meaning in LIKE patterns.
    const pattern = `%${text.replace(/[\\%_]/g, "\\$&")}%`;

    const result = await pool.query(
      `
        SELECT
          id,
          slug,
          name,
          description,
          category,
          price_cents,
          image_url,
          available,
          featured,
          prep_time_minutes
        FROM menu_items
        WHERE available = TRUE
          AND (name ILIKE $1 OR description ILIKE $1)
        ORDER BY (name ILIKE $1) DESC, featured DESC, name ASC
        LIMIT 30
      `,
      [pattern]
    );

    return res.status(200).json({
      data: result.rows.map(serializeMenuItem),
    });
  } catch (error) {
    return next(error);
  }
}

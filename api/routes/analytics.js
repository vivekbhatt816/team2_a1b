import { Router } from "express";
import { query } from "../db/postgres.js";

const router = Router();

// 1. Seven-day moving-average revenue
router.get("/revenue", async (req, res, next) => {
  try {
    const restaurantId = req.query.restaurant_id;

    // No restaurant_id or restaurant_id=all means return all restaurants.
    let selectedRestaurantId = null;

    if (
      restaurantId !== undefined &&
      restaurantId !== "" &&
      restaurantId !== "all"
    ) {
      selectedRestaurantId = Number(restaurantId);

      if (
        !Number.isSafeInteger(selectedRestaurantId) ||
        selectedRestaurantId <= 0
      ) {
        return res.status(400).json({
          error: "restaurant_id must be a positive integer or 'all'."
        });
      }
    }

    const r = await query(
      `
      WITH daily AS (
        SELECT
          o.restaurant_id,
          o.created_at::date AS d,
          SUM(o.total_amount) AS revenue,
          COUNT(*) AS order_count
        FROM orders o
        WHERE o.status = 'DELIVERED'
          AND o.created_at >= CURRENT_DATE - INTERVAL '90 days'
          AND o.created_at < CURRENT_DATE + INTERVAL '1 day'
        GROUP BY o.restaurant_id, o.created_at::date
      ),

      -- Generate a complete daily calendar for every restaurant.
      calendar AS (
        SELECT
          rest.id AS restaurant_id,
          gs::date AS d
        FROM restaurants rest
        CROSS JOIN LATERAL generate_series(
          CURRENT_DATE - INTERVAL '90 days',
          CURRENT_DATE,
          INTERVAL '1 day'
        ) AS gs
      ),

      -- Fill dates with no delivered orders with zero revenue.
      filled AS (
        SELECT
          c.restaurant_id,
          c.d,
          COALESCE(d.revenue, 0) AS revenue,
          COALESCE(d.order_count, 0) AS order_count
        FROM calendar c
        LEFT JOIN daily d
          ON d.restaurant_id = c.restaurant_id
         AND d.d = c.d
      ),

      -- Calculate moving averages across the complete date series.
      windowed AS (
        SELECT
          f.restaurant_id,
          f.d,
          f.revenue,
          f.order_count,

          AVG(f.revenue) OVER (
            PARTITION BY f.restaurant_id
            ORDER BY f.d
            RANGE BETWEEN INTERVAL '6 days' PRECEDING AND CURRENT ROW
          ) AS ma7_revenue

        FROM filled f
      )

      SELECT
        w.d AS business_date,
        w.restaurant_id,
        rest.name AS restaurant,
        rest.city,
        ROUND(w.revenue::numeric, 2) AS revenue_today,
        ROUND(w.ma7_revenue::numeric, 2) AS ma7_revenue

      FROM windowed w
      JOIN restaurants rest
        ON rest.id = w.restaurant_id

      -- Filter after calculating the moving average.
      WHERE (
        $1::int IS NULL
        OR w.restaurant_id = $1::int
      )

      ORDER BY w.d, rest.name
      `,
      [selectedRestaurantId]
    );

    res.json({
      data: r.rows
    });
  } catch (e) {
    next(e);
  }
});

router.get("/rankings", async (req, res, next) => {
  try {
    const r = await query(`
      WITH daily AS (
        SELECT o.restaurant_id,o.created_at::date AS d,SUM(o.total_amount) AS revenue,COUNT(*) AS order_count
        FROM orders o
        WHERE o.status='DELIVERED'
          AND o.created_at >= CURRENT_DATE - INTERVAL '90 days'
          AND o.created_at < CURRENT_DATE + INTERVAL '1 day'
        GROUP BY o.restaurant_id,o.created_at::date
      ),
      calendar AS (
        SELECT dr.restaurant_id,gs::date AS d
        FROM (SELECT DISTINCT restaurant_id FROM daily) dr
        CROSS JOIN LATERAL generate_series(CURRENT_DATE - INTERVAL '90 days',CURRENT_DATE,INTERVAL '1 day') gs
      ),
      filled AS (
        SELECT c.restaurant_id,c.d,COALESCE(dl.revenue,0) AS revenue,COALESCE(dl.order_count,0) AS order_count
        FROM calendar c LEFT JOIN daily dl ON dl.restaurant_id=c.restaurant_id AND dl.d=c.d
      ),
      windowed AS (
        SELECT f.*,
          AVG(f.revenue) OVER w7 AS ma7_revenue,
          SUM(f.order_count) OVER w7 AS orders_last_7d
        FROM filled f
        WINDOW w7 AS (
          PARTITION BY f.restaurant_id ORDER BY f.d
          RANGE BETWEEN INTERVAL '6 days' PRECEDING AND CURRENT ROW
        )
      )
      SELECT w.d AS business_date,w.restaurant_id,r.name AS restaurant,r.city,
             ROUND(w.revenue::numeric,2) AS revenue_today,
             ROUND(w.ma7_revenue::numeric,2) AS ma7_revenue,w.orders_last_7d,
             DENSE_RANK() OVER (PARTITION BY w.d ORDER BY w.ma7_revenue DESC) AS rank_by_ma7
      FROM windowed w JOIN restaurants r ON r.id=w.restaurant_id
      WHERE w.d=CURRENT_DATE-1
      ORDER BY rank_by_ma7,w.restaurant_id
      LIMIT 20
    `);
    res.json({ data: r.rows });
  } catch (e) { next(e); }
});

router.get("/summary", async (req, res, next) => {
  try {
    const r = await query(`
      SELECT restaurant_id,name,city,is_active,completed_orders,total_revenue,avg_order_value,last_order_at
      FROM mv_restaurant_performance
      ORDER BY total_revenue DESC LIMIT 20
    `);
    const refreshed = await query(`SELECT MAX(last_order_at) AS last_order_at FROM mv_restaurant_performance`);
    res.json({ data: r.rows, last_order_at: refreshed.rows[0]?.last_order_at || null });
  } catch (e) { next(e); }
});

router.post("/summary/refresh", async (req, res, next) => {
  try {
    await query("CALL sp_refresh_restaurant_performance()");
    res.json({ ok: true, message: "Restaurant performance materialized view refreshed." });
  } catch (e) { next(e); }
});

export default router;
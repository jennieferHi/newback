
import express from "express";
import db from "../utils/db.js"; 

const router = express.Router();

router
  .get("/", async (req, res) => {
    const {
      seller_id,
      start_date,
      end_date,
      category_id,
      product_name,
      page = 1,
      limit = 10,
    } = req.query;

    //  SQL查詢
    let countQuery = `
      SELECT COUNT(*) as total
      FROM order_data o
      JOIN order_detail od ON o.order_id = od.order_id
      JOIN products p ON od.product_id = p.product_id
      WHERE o.seller_id = ?
    `;
    let countParams = [seller_id]; // 用seller_id  查詢

    // 用日期篩選
    if (start_date && end_date) {
      countQuery += " AND o.payment_date BETWEEN ? AND ?";
      countParams.push(start_date, end_date);
    }

    if (category_id) {
      countQuery += " AND p.category_id = ?";
      countParams.push(category_id);
    }

    if (product_name) {
      countQuery += " AND p.product_name LIKE ?";
      countParams.push(`%${product_name}%`);
    }

    // 總查詢
    const [totalResults] = await db.query(countQuery, countParams);
    const totalPages = Math.ceil(totalResults[0].total / limit);

    // SQL
    let query = `
      SELECT o.*, p.product_name, p.category_id, c.category_name, od.purchase_quantity
      FROM order_data o
      JOIN order_detail od ON o.order_id = od.order_id
      JOIN products p ON od.product_id = p.product_id
      JOIN product_categories c ON p.category_id = c.category_id
      WHERE o.seller_id = ?
    `;
    let params = [seller_id]; 

    if (start_date && end_date) {
      query += " AND o.payment_date BETWEEN ? AND ?";
      params.push(start_date, end_date);
    }

    if (category_id) {
      query += " AND p.category_id = ?";
      params.push(category_id);
    }

    if (product_name) {
      query += " AND p.product_name LIKE ?";
      params.push(`%${product_name}%`);
    }

    // 分頁處裡
    const offset = (page - 1) * limit;
    query += " LIMIT ? OFFSET ?";
    params.push(parseInt(limit), offset);

    try {
      const [results] = await db.query(query, params);
      res.json({
        data: results,
        totalPages: totalPages
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })
  .get("/categories", async (req, res) => {
    try {
      const query = "SELECT * FROM product_categories";
      const [results] = await db.query(query);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })
  .get('/revenue/:sellerId', async (req, res) => {
    const sellerId = req.params.sellerId;
    const { start_date, end_date } = req.query;
  
    // 以日期查詢資料
    let query = `
      SELECT seller_id, SUM(total_sum) AS total_revenue
      FROM order_data
      WHERE seller_id = ? 
    `;
  
    let params = [sellerId];
  
    if (start_date && end_date) {
      query += ` AND payment_date BETWEEN ? AND ?`;
      params.push(start_date, end_date);
    }
  
    query += ' GROUP BY seller_id';
  
    try {
      const [results] = await db.query(query, params);
      const result = results[0] || { seller_id: sellerId, total_revenue: 0 };
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  

export default router;

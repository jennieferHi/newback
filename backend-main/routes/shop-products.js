// ?
import express from "express";
import db from "../utils/db.js";

const router = express.Router();

// 獲取店家資料
router.get("/seller/:seller_id", async (req, res) => {
  try {
    const sql = "SELECT * FROM seller WHERE seller_id = ?";
    const [row] = await db.query(sql, [req.params.seller_id]);
    res.json(row);
  } catch (error) {
    console.error("資料庫查詢店家出錯:", error);
  }
});

// 獲取店家商品資料
router.get("/products/:seller_id", async (req, res) => {
  try {
    const sql = "SELECT * FROM products WHERE seller_id = ?";
    const [row] = await db.query(sql, [req.params.seller_id]);
    res.json(row);
  } catch (error) {
    console.error("資料庫查詢產品出錯:", error);
  }
});
router.get("/theProduct/:product_id", async (req, res) => {
  try {
    const sql = `
    SELECT p.*, s.store_name
    FROM products p
    JOIN seller s ON p.seller_id = s.seller_id
    WHERE p.product_id = ?
  `;
    const [row] = await db.query(sql, [req.params.product_id]);
    res.json(row);
  } catch (error) {
    console.error("資料庫查詢產品出錯:", error);
  }
}); 
 
export default router;

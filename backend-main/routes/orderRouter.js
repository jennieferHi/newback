import express from 'express';
import db from '../utils/db.js';

const router = express.Router();

// 處理來自前端的請求，根據 seller_id 查詢相應的評論資料
router.get('/productId', async (req, res) => {
  try {
    const { product_id } = req.params;
    const sql = `
    SELECT 
    p.product_name, p.image_url, p.price, s.store_name, m.market_name FROM products p 
    JOIN seller s ON p.seller_id = s.seller_id  
    JOIN market_data m ON s.market_id = m.market_id 
    WHERE p.product_id BETWEEN 1 AND 4;
    `;
    const [rows] = await db.query(sql, [product_id]);
   return res.json(rows);
   
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Error fetching comments" });
  }
})

router.post('/custom', async (req, res) => {
  try {
    // const { comment_id } = req.params;
    const { custom_id} = req.body;
    const sql = 'select * from custom where custom_id=?';
    const [result] = await db.query(sql, [custom_id]);
   return res.json({ success: true, message: result});
  } catch (error) {
    console.error("Error posting reply:", error);
    res.status(500).json({ error: "Error posting reply" });
  }
});

export default router;

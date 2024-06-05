import express from 'express';
import db from '../utils/db.js';

const router = express.Router();

// 處理來自前端的請求，根據 seller_id 查詢相應的評論資料
router.get('/getorderId', async (req, res) => {
  try {
    const { seller_id } = req.params;
    const sql = `
      SELECT 
        c.store_rating, 
        c.photo, 
        c.comment, 
        c.datetime, 
        cu.custom_account
      FROM 
        comment c
      JOIN 
        order_data od ON c.order_id = od.order_id
      JOIN 
        custom cu ON od.custom_id = cu.custom_id
      WHERE 
        c.seller_id = ?;
    `;
    const [rows] = await db.query(sql, [seller_id]);
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

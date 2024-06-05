import express from "express";
import db from "../utils/db.js";

const QRrouter = express.Router();

// 獲取前端的數據
QRrouter.get("/details/:qrcode_id", async (req, res) => {
  const { qrcode_id } = req.params;
  try {
    const sql = `
    SELECT 
    c.custom_account,
    p.product_name,
    od.total_sum,
    qdr.status,
    p.seller_id,
    qdr.product_id,
    qdr.count
FROM 
    qrcode_record qr
JOIN
    custom c ON qr.custom_id = c.custom_id
JOIN
    order_data od ON qr.order_id = od.order_id
JOIN
    qrcode_detail_record qdr ON qr.qrcode_id = qdr.qrcode_id
JOIN
    products p ON qdr.product_id = p.product_id
WHERE 
    qr.qrcode_id =  ?
        `;
    const [rows] = await db.query(sql, [qrcode_id]);
    if (rows.length > 0) {
      res.json(rows);
    } else {
      res.status(404).json({ message: "No details found for this qrcode ID." });
    }
  } catch (error) {
    console.error("Failed to retrieve order details:", error);
    res.status(500).json({
      message: "Server error while retrieving order details.",
      error: error.message,
    });
  }
});

// 更新訂單狀態
QRrouter.put("/update-status/:qrcode_id", async (req, res) => {
  const { qrcode_id } = req.params;
  const { status } = req.body; // 解構出狀態

  try {
    const sql = `
            UPDATE qrcode_detail_record
            SET status = ?
            WHERE qrcode_id = ?
        `;
    const [result] = await db.query(sql, [status, qrcode_id]);

    if (result.affectedRows > 0) {
      res.json({ message: "訂單更新成功" });
    } else {
      res.status(404).json({ message: "訂單更新失敗" });
    }
  } catch (error) {
    console.error("更新订单状态失败:", error);
    res.status(500).json({ message: "伺服器錯誤", error: error.message });
  }
});

export default QRrouter;

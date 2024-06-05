import db from "../utils/db.js";
import fs from "fs";
import path from "path";


// 產品加入購物車
export async function showProduct(req, res) {
    const sql = "INSERT INTO order_data ( `order_id`, `order_number`, `custom_id`, `seller_id`, `discount_category_id`, `consume_gamepoint`, `total_sum`, `payment-date`) VALUES (?) ";


    const values = [
        req.body.order_id,
        req.body.order_number,
        req.body.custom_id,
        req.body.seller_id,
        req.body.discount_category_id,
        req.body.consume_gamepoint,
        req.body.total_sum,
        req.body.payment,
    ];
    try {
        const [result] = await db.query(sql, [values]);
        return res.send({ status: "Success" });
    } catch (err) {
        console.error("Error executing SQL query:", err);
        return res.status(500).json({ error: "An error occurred while processing the request" });
    }
}



//顯示熱銷產品
export async function showProduct(req, res) {
    const t_sql = `SELECT product_name, image_url,store_name,market_name FROM products p JOIN seller s  ON p.seller_id = s.seller_id JOIN  market_data m ON  s.market_id = m.market_id  WHERE product_id BETWEEN 1 AND 4`;
    try {
        const [totalRows] = await db.query(t_sql);
        return res.send(totalRows);
    } catch (err) {
        console.error("Error executing SQL query:", err);
        return res.status(500).json({ error: "An error occurred while processing the request" });
    }
}

//顯示
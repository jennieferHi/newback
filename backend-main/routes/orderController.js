import db from "../utils/db.js";
import fs from "fs";
import path from "path";


// 產品加入購物車
export async function addToCart(req, res) {
    const sql = "INSERT INTO order_data (`order_id, order_number`,`custom_id`,`seller_id`,`discount_category_id`,`consume_gamepoint`,`total_sum`,`payment`) VALUES (?)";
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


//購物車:step1訂單查詢
export async function orderSeller(req, res) {
    const sql = "SELECT p.product_name, p.image_url, p.price, s.store_name, m.market_name FROM products p JOIN seller s ON p.seller_id = s.seller_id  JOIN market_data m ON s.market_id = m.market_id WHERE p.product_id = 1 ";

    const values = [
        req.body.author,
        req.body.bookname,
        // req.body.category_sid,
        // req.file.filename
    ];

    try {
        const [result] = await db.query(sql, [values]);
        return res.send({ status: "Success" });
    } catch (err) {
        console.error("Error executing SQL query:", err);
        return res.status(500).json({ error: "An error occurred while processing the request" });
    }
}


export async function orderProduct(req, res) {
    const sql = "INSERT INTO products (`author`,`bookname`,`category_sid`,`image`) VALUES (?)";
    const values = [
        req.body.author,
        req.body.bookname,
        req.body.category_sid,
        req.file.filename
    ];

    try {
        const [result] = await db.query(sql, [values]);
        return res.send({ status: "Success" });
    } catch (err) {
        console.error("Error executing SQL query:", err);
        return res.status(500).json({ error: "An error occurred while processing the request" });
    }
}
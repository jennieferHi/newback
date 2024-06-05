import db from "../utils/db.js";
// import { ISOtodate } from "../utils/day.js";
import { date } from '../utils/date.js';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
export const insertMemberForm = async (req, res) => {
    // 新增顧客資料 
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const sql = "insert into account (`name`,`email`,`address`,birthday,password)values(?)"
    const values = [
        req.body.name,
        req.body.email,
        req.body.address,
        req.body.birthday,
        hashedPassword
    ]
    await db.query(sql, [values])
        .then((res2) => {
            if (!res2) {
                return res.json({ status: 401, error: "Error in signup query" });
            } else {
                return res.send({ status: "Success" });
            }
        })
        .catch((err) => {
            console.error("Error executing SQL query:", err);
            return res.status(500).json({ error: "An error occurred while processing the request" });
        });
}
export const updateMemberForm = async (req, res) => {
    try {
        console.log(req.body)
        const email = req.body.email || false;
        const password = req.body.password || false;
        if (!email || !password) {
            return { success: false, msg: "請檢查欄位" }
        }
        const sql = "UPDATE account SET   Password=? WHERE email=?";
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const values = [
            hashedPassword,
            req.body.email,

        ];
        await db.query(sql, values);
        return res.send({ success: true,msg:"修改成功" });
    } catch (error) {
        console.error("Error executing SQL query:", error);
        return res.status(500).json({ error: "An error occurred while processing the request" });
    }
}
// 登入
export const selectAccount = async (req, res) => {
    const email = req.body.email || 1;
    const password = req.body.password || 1;
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = "select * from account where email=?"

    try {
        const result = await db.query(sql, [email]);

        if (result[0].length <= 0) {
            return res.json({ success: false, error: "Error in signup query" });
        }

        const user = result[0][0];
        const res_password = user.password;

        const isMatch = await bcrypt.compare(password, res_password);
        if (isMatch) {
            const token = jwt.sign(
                {
                    email: email
                },
                process.env.JWT_SECRET
            );
            return res.json({ success: true, email, token });
        } else {
            return res.json({ success: false, error: "密碼錯誤" });
        }
    } catch (err) {
        return res.status(500).json({ error: "An error occurred while processing the request" });
    }

}
// index.js

import express from "express";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import db from "./utils/db.js";
//hash
import bcrypt from "bcryptjs";
//JWT
import jwt from "jsonwebtoken";
import index from "./routes.js";
import bodyParser from "body-parser";  
import shopRouter from "./routes/shop-products.js"; 
import cartRouter from './routes/cartRouter.js'
import session from 'express-session' 

 
const app = express();
const PORT = process.env.WEB_PORT || 3003;
app.use(
  cors({
    origin: "http://localhost:3000", // 允许的前端源
    methods: ["GET", "POST", "PUT", "DELETE"], // 允许的HTTP方法
    credentials: true, // 允许跨域带认证信息（cookies）
  })
);

app.set("view engine", "ejs");

// top-level middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))
 
// 自訂的頂層middleware
app.use((req, res, next) => {
  // res.locals.title = "NightMarket Hunter"; //設定網站名稱

  // 處理 JWT token
  const auth = req.get("Authorization");
  if (auth && auth.indexOf("Bearer ") === 0) {
    const token = auth.slice(7); // 去掉 "Bearer "
    try {
      // res.locals.my_jwt(放在此比較安全但現在res.req不同)
      //要確認my_jwt沒用過,像req.body已經被使用了
      req.my_jwt = jwt.verify(token, process.env.JWT_SECRET);
    } catch (ex) {}
  }

  next(); //呼叫他才能往下 不然網頁會一直停留在讀取旋轉
});

// Google會員登入
// app.post("/google-login", async (req, res) => {
//   // console.log(req.body);
//   //   res.json({ data: {} });
//   // });

//   // 檢查從react來的資料
//   if (!req.body.providerId || !req.body.uid) {
//     return res.json({ status: 'error', message: '缺少google登入資料' })
//   }

//   const { displayName, email, uid, photoURL } = req.body || {};
//   const google_uid = uid;

//    // 以下流程:
//   // 1. 先查詢資料庫是否有同google_uid的資料
//   // 2-1. 有存在 -> 執行登入工作
//   // 2-2. 不存在 -> 建立一個新會員資料(無帳號與密碼)，只有google來的資料 -> 執行登入工作

//   const output = {
//     success: false,
//     error: "",
//     code: 0,
//     //當success變為true要的資料
//     data: {
//       custom_id: 0,
//       account: "",
//       google_uid: "",
//       token: "",
//     },
//   };

//   const sql = "SELECT * FROM custom WHERE google_uid=?";
//   const [rows] = await db.query(sql, [google_uid]);
//   const row = rows[0];
//   if (rows.length) {
//   // 如果有搜尋到資料 = 進行登入

//   output.success = true;
//     // 打包  JWT
//     const token = jwt.sign(
//       {
//         custom_id: row.custom_id,
//         account: row.custom_account,
//         google_uid: row.google_uid,
//       },
//       // process.env.JWT_SECRET >> 去看 dev.env 檔
//       process.env.JWT_SECRET
//     );
//     output.data = {
//       custom_id: row.custom_id,
//       account: row.custom_account,
//       google_uid: row.google_uid,
//       token,
//     };
//   } else {
//     // 如果沒有搜尋到資料=進行註冊
//     let result = {};
//     const sql =
//       "INSERT INTO custom (custom_name, custom_account, google_uid, photo_url) VALUES (?, ?, ?, ?)";
//     try {
//       [result] = await db.query(sql, [
//         displayName,
//         email,
//         google_uid,
//         photoURL,
//       ]);
//       if (result && result.insertId) {
//         const custom_id = result.insertId;
//       output.success = !!result.affectedRows;
//       // 打包  JWT
//       const token = jwt.sign(
//         {
//           custom_id: custom_id,
//           account: email,
//           google_uid: google_uid,
//         },
//         // process.env.JWT_SECRET >> 去看 dev.env 檔
//         process.env.JWT_SECRET
//       );
//       output.data = {
//         custom_id: custom_id,
//         account: email,
//         google_uid: google_uid,
//         token,
//       };
//     }else {
//       output.error = "註冊失敗";
//     }
//   } catch (ex) {
//   }
//   }
//   res.json(output);
// });

app.get("/jwt-data", async (req, res) => {
  res.json(req.my_jwt);
});
 
 
// 購物車結帳路由

 
// 會員路由
// app.use("/images", express.static(path.join(__dirname, "public/discuss/")));
app.use("/backNew", index);

/*---其他路由放在這之前---*/

//處理路由
app.use((req, res) => {
  res.status(404).send(`<h2>404 走錯路了</h2>`);
});

app.listen(3002, '127.0.0.1', () => {
  console.log('Server running at http://127.0.0.1:3002/');
})

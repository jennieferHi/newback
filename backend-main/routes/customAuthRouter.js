// authRouter.js
import express from "express";
//hash
import bcrypt from "bcryptjs";
//JWT
import jwt from "jsonwebtoken";
import db from "../utils/db.js";

// postman 測試路由 : http://localhost:3002/custom-auth/login-jwt
const customAuthRouter = express.Router();

// customAuthRouter.use((req, res, next) => {
//   res.locals.title = "NightMarket Hunter"; //設定網站名稱

//   // 處理 JWT token
//   const auth = req.get("Authorization");
//   if (auth && auth.indexOf("Bearer ") === 0) {
//     const token = auth.slice(7); // 去掉 "Bearer "
//     try {
//       // res.locals.my_jwt(放在此比較安全但現在res.req不同)
//       //要確認my_jwt沒用過,像req.body已經被使用了
//       req.my_jwt = jwt.verify(token, process.env.JWT_SECRET);
//     } catch (ex) {}
//   }

//   next(); //呼叫他才能往下 不然網頁會一直停留在讀取旋轉
// });

customAuthRouter.post("/login-jwt", async (req, res) => {
  let { account, password } = req.body || {};
  const output = {
    success: false,
    error: "",
    code: 0,
    // postData: req.body,
    //當success變為true要的資料
    data: {
      custom_id: 0,
      account: "",
      nickname: "",
      token: "",
    },
  };
  if (!account || !password) {
    output.error = "欄位資料不足";
    output.code = 400;
    return res.json(output);
  }
  account = account.trim();
  password = password.trim();
  const sql = "SELECT * FROM custom WHERE custom_account=?";
  const [rows] = await db.query(sql, [account]);
  if (!rows.length) {
    // 帳號是錯的
    output.error = "帳號或密碼錯誤";
    output.code = 420;
    return res.json(output);
  }
  const row = rows[0];
  const result = await bcrypt.compare(password, row.custom_password);
  if (result) {
    // 帳號是對的, 密碼也是對的
    output.success = true;
    // 打包  JWT
    const token = jwt.sign(
      {
        custom_id: row.custom_id ,
        account: row.custom_account ,
      },
      // process.env.JWT_SECRET >> 去看 dev.env 檔
      process.env.JWT_SECRET
    );
    output.data = {
      custom_id: row.custom_id ,
      account: row.custom_account ,
      nickname: row.custom_nickname,
      token,
    };
  } else {
    // 密碼是錯的
    output.error = "帳號或密碼錯誤";
    output.code = 450;
  }
  res.json(output);
});

// customAuthRouter.get("/jwt-data", async (req, res) => {
//   // let payload = {};
//   // const auth = req.get("Authorization");
//   // //必須接auth(範例為Bearer (後面是token),indexOf是判斷切割部分為第0(沒有值會回傳-1,如果Bearer 在後面就不是0))
//   // if (auth && auth.indexOf("Bearer ") === 0) {
//   //   const token = auth.slice(7); // 去掉 "Bearer "
//   //   //防止crash進行try catch(但不處理)
//   //   try {
//   //     // process.env.JWT_SECRET>>去看dev.env檔
//   //     payload = jwt.verify(token, process.env.JWT_SECRET);
//   //   } catch (ex) {}
//   // }
//   // res.json(payload);
//   // 上面的部分移到top-middleware,這裡就單純接受到jwt.verify(token, process.env.JWT_SECRET就好
//   res.json(req.my_jwt);
// });


// // 使用 multer().none() 表示不处理文件上传
// customAuthRouter.post("/login", upload.none(), async (req, res) => {
//   const { account, password } = req.body;
//   try {
//     const query = "SELECT * FROM account WHERE account = ? AND password = ?";
//     const [rows] = await db.query(query, [account, password]);
//     if (rows.length > 0) {
//       const sellerId = rows[0].seller_id;
//       res.status(200).json({ success: true, message: "登入成功", sellerId });
//     } else {
//       res.status(401).json({ success: false, message: "帳號或密碼錯誤" });
//     }
//   } catch (error) {
//     console.error("登入失敗", error);
//     res.status(500).json({ success: false, message: "登入失敗" });
//   }
// });

// // 賣家註冊
// customAuthRouter.post("/register", async (req, res) => {
//   const { account, password } = req.body;
//   try {
//     const query = "INSERT INTO account (account, password) VALUES (?, ?)";
//     const result = await db.query(query, [account, password]);
//     res.status(200).json({ success: true, message: "註冊成功" });
//   } catch (error) {
//     console.error("註冊失敗", error);
//     res.status(500).json({ success: false, message: "註冊失敗" });
//   }
// });

export default customAuthRouter;

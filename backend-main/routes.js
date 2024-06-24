 // paypal
import { paypalPayMoney, clientToken } from "./controllers/paypalController.js"; 
import {linePayBox } from "./controllers/lineController.js"; 
// 基本資料修改 包括圖片訊息
import { selectAccount,insertMemberForm, updateMemberForm } from "./controllers/jsonFormConsroller.js"; 
import { callbackEmail, sendEmail,sendEmailAuth } from "./controllers/sendEmailConstroller.js"; 
 
const { CLIENT_ID, CLIENT_SECRET, JWT_SECRET, REDIRECT_URI } = process.env;
import express from 'express';
const app = express.Router();


// app.get("/", hellojsonTable);
// app.get("/jsonTableSearch", jsonTableSearch);
// app.post("/create", jsonFormTa);
//++ 顧客資料 
 // 一般會員登入 
  
// 顧客資料
app.post("/user/selectAccount", selectAccount);
// 新增資料
app.post("/user/insertMemberForm", insertMemberForm);
// 更新資料
app.post("/user/updateMemberForm", updateMemberForm);
 

// paypal
app.post("/paypalPayMoney", paypalPayMoney);
app.get("/paypalPayMoney/client_token", clientToken); 
 
 
// linePayBox
app.post("/linePayBox",linePayBox)

// sendEmail
// 送email
app.post("/auth/send/email",sendEmail)
// 檢查email
app.post("/auth/check/email",sendEmailAuth)
app.post("/auth/google/callback",callbackEmail)
// 測試
app.get('/auth', (req, res) => { 
    return   res.render("index");
   });

 

export default app;
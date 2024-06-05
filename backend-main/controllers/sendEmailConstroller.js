

// controllers/paypalController.js
import db from "../utils/db.js";
import fs from "fs";
import otpGenerator from 'otp-generator'
import nodemailer from "nodemailer";
import googleOAuth2Client from '../config/googleOAuth2Client.js';

const SCOPES = [
  'https://mail.google.com/',
];


export const callbackEmail = async (req, res) => {
  const code = req.query.code;
  try {
    const { tokens } = await googleOAuth2Client.getToken(code)

    googleOAuth2Client.setCredentials(tokens);
    req.session.tokens = tokens;

    res.redirect('/email/send');
  } catch (err) {
    console.error('Error authenticating with Google:', err);
    res.status(500).send('Error authenticating with Google');
  }
};

export const sendEmail = async (req, res) => {
  let result = { success: true, msg: "" };
  let email = req.body.email;
  if (!email) {
    result.success = false;
    result.msg = "email為空";
    return res.json(result);
  } else {
    try {
      const t_ssql = `select update_time,opt from account WHERE email = ? `;
      const totalRows = await db.query(t_ssql, [email]);
      if (totalRows.length > 0) { 
        const update_time = totalRows[0][0].update_time; 
       const opt = totalRows[0][0].opt; 
        // 尚未過期
        if (!getTime2(update_time) && opt) { 
          result.success = false;
          result.msg = "驗證碼尚未過期，請查看email，五分鐘後再試";
          return res.json(result);
        } 
        else {
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.GMAIL_USER,
              pass: process.env.GMAIL_PASS,
            },
          });
          await transporter.verify();
          const optdata = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
          const currentTime = new Date();
          try {
            await db.query(`UPDATE account
                            SET opt = ?,update_time=?
                            WHERE email = ?`, [optdata, currentTime, email]);
            const mailOptions = {
              from: 'awd0900814212@gmail.com',
              to: email,
              subject: '你好，您的密碼',
              text: '你好，您的密碼'+optdata,
            };

            transporter.sendMail(mailOptions, (err, info) => {
              if (err) {
                console.error(err);
                result.success = false;
                result.msg = "驗證碼尚未過期，請查看email，5分鐘後即可重新設置";
                res.status(500).send({ success: false, msg: 'Error sending email' });
              } else {
                console.log(info);
                res.json({ success: true, msg: '請收取Email驗證碼', opt: optdata });
              }
            });
          } catch (err) {
            console.error("Error executing SQL query:", err);
          }
        }
      } else {
        result.success = false;
        result.msg = "email錯誤";
        res.json(result);
      }
    } catch (err) {
      console.error("Error executing SQL query:", err);
      result.success = false;
      result.msg = "err";
      res.json(result);
    }
  }
};
export const sendEmailAuth = async (req, res) => {
  let result = { success: true, meg: "" };
  let email = req.body.email;
  if (!email) {
    result.success = false;
    result.meg = "email為空";
    return result;
  } else {
    try {
      const t_ssql = `select  update_time , opt from account WHERE email = ? `;
      const totalRows = await db.query(t_ssql, [email]);
      const update_time = totalRows[0][0].update_time;
      const opt = totalRows[0][0].opt;
      console.log(opt);
      console.log(req.body.opt);
      // 是否有用戶

      if (totalRows && opt) {
        // 是否有驗證碼
        if (!getTime2(update_time)) {
          //判斷是否相同
          if (opt == req.body.opt) {
            return res.json({ success: true, msg: "成功請輸入密碼" ,status:"200"});
          } else {
            return res.json({ success: false, msg: "驗證碼錯誤",status:"402" });
          }

        } else {
          return res.json({ success: false, msg: "驗證碼已經過期請點選重新發送" ,status:"401"});

        }
      } else {
        return res.json({ success: false, msg: "email或者opt錯誤",status:"402" });
      }

    } catch (err) {
      console.error("Error executing SQL query:", err);
      return { success: false, msg: err };
    }

  }
}
function getTime2(update_time) {
  const givenTime = new Date(update_time);
  const currentTime = new Date();
  // 差值（毫秒）
  const timeDifferenceInMillis = currentTime - givenTime;
  // 毫秒轉分鐘
  const timeDifferenceInMinutes = Math.floor(timeDifferenceInMillis / (1000 * 60));
  //差值?5分鐘
  console.log(givenTime)
  console.log(currentTime)
  console.log(timeDifferenceInMinutes)
  const isDiff2 = timeDifferenceInMinutes > 5;
  // true回傳過期
  if (isDiff2) {
    // 過期
    return true;
  }
  // 尚未過期 還可以用
  return false;
}


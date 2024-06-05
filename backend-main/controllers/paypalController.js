

// controllers/paypalController.js
import db from "../utils/db.js";
import fs from "fs";
import path from "path";
import braintree from "braintree";
import gateway from "../utils/paypayMoney.js";


// 定義並導出功能
export const paypalPayMoney = async (req, res) => {
    console.log(req.body.nonce);
    gateway.transaction.sale({
        amount: "1.00",
        paymentMethodNonce: req.body.nonce,
        options: {
            submitForSettlement: true,
        },
    }).then((result) => {
        console.log(result);
    }).catch((err) => {
        console.error(err);
    });
};

export const clientToken = async (req, res) => {
    console.log("Generating client token");
    gateway.clientToken.generate({}, (err, response) => {
        res.send({data: response.clientToken});
    });
};

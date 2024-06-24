 
import axios from "axios";
import uuid from "uuid4";   
import hmacsha256 from 'crypto-js/hmac-sha256.js';
import Base64 from 'crypto-js/enc-base64.js';


export const linePayBox = async (req, res) => {
  let key = '3283f0fb1477b6c0981cf4188a621fee'
  let nonce = uuid()
  let uri = '/v3/payments/request'
 
  const body=req.body;
  console.log(body)
  let encrypt =  hmacsha256(key + uri + JSON.stringify(body) + nonce, key)
 
 
  let hmacBase64 = Base64.stringify(encrypt)
  console.log(hmacBase64)
  let configs = {
    headers: {
      'Content-Type': 'application/json',
      'X-LINE-ChannelId': 2003132121,
      'X-LINE-Authorization-Nonce': nonce,
      'X-LINE-Authorization': hmacBase64,

    }
  }

  const data=await axios.post('https://sandbox-api-pay.line.me/v3/payments/request', body, configs).then(async res => {
    // await console.log(res.data) 
    const data=await res.data;
     return data;
  })
  res.send(data);
};
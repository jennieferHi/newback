// 使用 ESM 導入語法導入 braintree
import braintree from 'braintree';

// 創建一個 BraintreeGateway 實例
const gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: 'xdk66bxgj8w6cdbf',
    publicKey: 'crmczsjvcjpvqrxh',
    privateKey: '4fa7abe423ebe01d1bd2c063fdec1afa'
});

// 使用 export default 導出 gateway
export default gateway;

import express from "express";
import fetch from "node-fetch";
import db from "../utils/db.js";

const router = express.Router();

// tdx ----------
const TDX_TOKEN_ENDPOINT =
  "https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token";
const { CLIENT_ID, CLIENT_SECRET } = process.env;

// 取得授權
async function getAccessToken() {
  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");
  params.append("client_id", CLIENT_ID);
  params.append("client_secret", CLIENT_SECRET);

  try {
    const response = await fetch(TDX_TOKEN_ENDPOINT, {
      method: "POST",
      body: params,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const data = await response.json();
    return data.access_token; // 從回應中獲取 access_token
  } catch (error) {
    console.error("獲取 Access Token 錯誤:", error);
    return null;
  }
}
//   try {
//     const accessToken = await getAccessToken();
//     if (accessToken) {
//       res.json({ accessToken: accessToken });
//     } else {
//       res.status(500).json({ message: "無法獲取 Access Token" });
//     }
//   } catch (error) {
//     console.error("獲取 Access Token 出現錯誤", error);
//     res.status(500).json({ message: "後端處理出錯" });
//   }
// });

// 串公車站牌 api
async function getNearbyBusStopsByMarketId(market_id, radius) {
  const sql = `SELECT latitude_and_longitude FROM market_data WHERE market_id = ?`;
  const [rows] = await db.query(sql, [market_id]);

  if (rows.length === 0) {
    throw new Error("找不到指定市場的經緯度資料");
  }

  const [latitude, longitude] = rows[0].latitude_and_longitude.split(", ");

  // 獲取 Access Token
  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new Error("無法獲取 Access Token");
  }

  const TDX_API_URL = `https://tdx.transportdata.tw/api/advanced/v2/Bus/Stop/NearBy?%24spatialFilter=nearby%28${latitude}%2C%20${longitude}%2C%20100%29&%24format=JSON`;

  try {
    const response = await fetch(TDX_API_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    // 檢查回應碼和 Content-Type
    if (!response.ok) {
      throw new Error(`API 請求失敗，狀態碼：${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("回應不是有效的 JSON 格式");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("調用 TDX API 查詢公車站牌信息出錯:", error);
    return null;
  }
}
// 串停車場 api
async function getNearbyCarStopsByMarketId(market_id) {
  const sql = `SELECT latitude_and_longitude FROM market_data WHERE market_id = ?`;
  const [rows] = await db.query(sql, [market_id]);

  if (rows.length === 0) {
    throw new Error("找不到指定市場的經緯度資料");
  }

  const [latitude, longitude] = rows[0].latitude_and_longitude.split(", ");

  // 獲取 Access Token
  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new Error("無法獲取 Access Token");
  }

  const TDX_API_URL = `https://tdx.transportdata.tw/api/advanced/V3/Map/GeoLocating/Parking/Nearby/LocationX/${longitude}/LocationY/${latitude}`;
  try {
    const response = await fetch(TDX_API_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    // 檢查回應碼和 Content-Type
    if (!response.ok) {
      throw new Error(`API 請求失敗，狀態碼：${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("回應不是有效的 JSON 格式");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("調用 TDX API 查詢停車場信息出錯:", error);
    return null;
  }
}
// 測試路由
router.get("/test-tdx/:market_id", async (req, res) => {
  const { market_id } = req.params;
  try {
    const busStopsData = await getNearbyCarStopsByMarketId(market_id);
    if (busStopsData) {
      res.json(busStopsData);
    } else {
      res.status(404).json({ message: "沒有找到停車場資訊" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "無法獲取附近的停車場資訊", error: error.message });
  }
});

// 計算距離公式
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // 地球半徑，單位為米
  const φ1 = (lat1 * Math.PI) / 180; // φ, λ 轉換成弧度
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // 最終距離，單位為米
  return distance;
}
// 換算路程公式
const walkingSpeedPerMinute = 60; // 每分鐘60米
function calculateWalkingTime(distance) {
  return distance / walkingSpeedPerMinute;
}

// 公車路由
router.get("/bus-distance/:marketId", async (req, res) => {
  const market_id = req.params.marketId;

  try {
    const sql = `SELECT latitude_and_longitude FROM market_data WHERE market_id = ?`;
    const [rows] = await db.query(sql, [market_id]);

    if (rows.length === 0) {
      throw new Error("找不到指定市場的經緯度資料");
    }

    const [latitude, longitude] = rows[0].latitude_and_longitude.split(", ");

    const busStopsData = await getNearbyBusStopsByMarketId(market_id);

    const busStopsWithDistance = busStopsData.map((stop) => {
      const stopLat = parseFloat(stop.StopPosition.PositionLat);
      const stopLon = parseFloat(stop.StopPosition.PositionLon);

      const distance = calculateDistance(latitude, longitude, stopLat, stopLon);
      const walkingTime = calculateWalkingTime(distance);

      // 返回包含站點名、經緯度和距離的新對象
      return {
        stopId: stop.StopID,
        stopName: stop.StopName.Zh_tw,
        latitude: stopLat,
        longitude: stopLon,
        distance: distance,
        walkingTime: walkingTime.toFixed(0),
      };
    });

    res.json(busStopsWithDistance);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});
// 停車場路由
router.get("/car-distance/:market_id", async (req, res) => {
  const { market_id } = req.params;
  try {
    const carStopsData = await getNearbyCarStopsByMarketId(market_id);
    if (carStopsData) {
      res.json(carStopsData);
    } else {
      res.status(404).json({ message: "沒有找到停車場資訊" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "無法獲取附近的停車場資訊", error: error.message });
  }
});
// tdx ----------

// search
router.get("/search/:market_name", async (req, res) => {
  try {
    const market_name = req.params.market_name;
    const sql = "SELECT * FROM market_data WHERE market_name LIKE ?";
    const [row] = await db.query(sql, [`%${market_name}%`]);
    if (row.length > 0) {
      // 如果找到相應的夜市，則返回數據
      res.json(row[0]);
    } else {
      // 如果沒有找到，返回空結果
      console.log(`沒有找到夜市資料`);
    }
  } catch (error) {
    console.log(`後端 /search/:market_name 錯誤 : ${error}`);
  }
});

// 找出對應夜市的店家
router.get("/seller/:market_id", async (req, res) => {
  try {
    const market_id = req.params.market_id;
    const sql = `SELECT * FROM seller WHERE market_id = ?`;
    const [row] = await db.query(sql, [market_id]);
    res.json(row);
  } catch (error) {
    console.log(`後端 /seller/:market_id 錯誤 : ${error}`);
  }
});

// 找出對應夜市的資訊
router.get("/:market_id", async (req, res) => {
  try {
    const market_id = req.params.market_id;
    const sql = `SELECT * FROM market_data WHERE market_id = ?`;
    const [row] = await db.query(sql, [market_id]);
    res.json(row);
  } catch (error) {
    console.log(`獲取夜市資料錯誤: ${error}`);
  }
});

// 分類搜尋
router.get("/category/:category_id", async (req, res) => {
  try {
    const category_id = req.params.category_id;
    const sql = `
      SELECT DISTINCT s.* FROM seller AS s
      JOIN products AS p ON s.seller_id = p.seller_id
      WHERE p.category_id = ?
    `;
    const [row] = await db.query(sql, [category_id]);
    if (row.length > 0) {
      res.json(row);
    } else {
      // 如果沒有找到相應的店家，返回空結果
      res.status(404).json({ message: "沒有找到相應的店家資料" });
    }
  } catch (error) {
    console.error(`後端 /category/:category_id 錯誤: ${error}`);
    res.status(500).json({ message: "伺服器錯誤" });
  }
});

// 獲取每個商店的平均評分和評論總數
router.get("/store-ratings/:market_id", async (req, res) => {
  try {
    const market_id = req.params.market_id;
    const sql = `
      SELECT s.seller_id, s.store_name, 
             AVG(c.night_rating) AS average_night_rating, 
             COUNT(c.comment) AS total_comments
      FROM seller s
      LEFT JOIN comment c ON s.seller_id = c.seller_id
      WHERE s.market_id = ?
      GROUP BY s.seller_id;
    `;
    const [row] = await db.query(sql, [market_id]);
    res.json(row);
  } catch (error) {
    console.error(`後端 /store-ratings/:market_id 錯誤: ${error}`);
    res.status(500).json({ message: "伺服器錯誤" });
  }
});

// 取得廣告圖路徑
router.get("/ad/banner", async (req, res) => {
  try {
    const sql = "SELECT `image_path` FROM `advertisements` WHERE `ad_type` = 1";
    const [row] = await db.query(sql);
    res.json(row);
  } catch (error) {
    console.error("bannerAd出錯:", error);
  }
});

export default router;
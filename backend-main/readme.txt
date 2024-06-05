==============================
response 呈現
------------------------------
  res.end()     # 預設 text/plain
  res.send()    # 依資料不同輸出不同格式
  res.render()  # 以樣版檔呈現頁面 text/html
  res.json()    # 輸出 JSON 格式
  res.redirect()  # 轉向
==============================
request 帶資料進入
------------------------------
  req.query
  req.params
  req.body
  req.file
  req.files
  req.session
==============================
前端發送表單資料的格式
------------------------------
  1. application/x-www-form-urlencoded
  2. application/json
  3. multipart/form-data
==============================
可迭代的類型
------------------------------
  例如: HTMLCollection, NodeList, FileList
  長得像陣列, 會有 length 屬性
  1. 可以用 for/of 迴圈
  2. 可以用 spread operator 展開變成陣列
  3. 會有 Symbol.iterator 的屬性
==============================
RESTful API 一般的設計方式
------------------------------
GET     /products     # 讀取列表資料
GET     /products/17  # 讀取單項資料 /products/:pid
POST    /products     # 新增一筆資料
PUT     /products/17  # 修改單項資料
DELETE  /products/17  # 刪除單項資料
==============================
links 
------------------------------
https://tw.yahoo.com/aaaa/bbb?a=100
//tw.yahoo.com/aaaa/bbb?a=100
/aaaa/bbb?a=100
?a=100
#hello
空字串
==============================

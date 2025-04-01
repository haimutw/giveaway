<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <title>管理員頁面</title>
  <style>
    body {
      background: #333;
      color: #fff;
      font-family: sans-serif;
      padding: 20px;
    }
    h1 {
      text-align: center;
      margin-bottom: 20px;
    }
    .admin-box {
      max-width: 600px;
      margin: 0 auto;
      background: #444;
      padding: 20px;
    }
    p {
      margin: 8px 0;
    }
  </style>
</head>
<body>
  <h1>管理員頁面</h1>
  <div class="admin-box">
    <h2>參與者資料 (data.html)：</h2>
    <?php include('data.html'); ?>
  </div>
</body>
</html>

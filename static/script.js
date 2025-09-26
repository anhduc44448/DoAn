<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Chess Web</title>
  <!-- SỬ DỤNG ĐƯỜNG DẪN TƯƠNG ĐỐI -->
  <link rel="stylesheet" href="static/style.css">
</head>
<body>
  <h2>Chess Game</h2>
  <div id="turn" style="margin-bottom:10px;font-weight:bold;"></div>
  <div id="chessboard"></div>

  <div style="margin-top: 10px;">
    <button onclick="aiMove()">AI Move</button>
    <button onclick="resetBoard()">Reset</button>
  </div>

  <script src="static/script.js"></script>
</body>
</html>

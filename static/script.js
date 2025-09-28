const socket = io();

const boardDiv = document.getElementById("chessboard");
let currentBoard = [];
let selectedSquare = null;
let currentRoom = null;

socket.on("connect", () => {
  console.log("✅ Connected to server");
});

// Nhận update bàn cờ từ server
socket.on("board_update", (data) => {
  currentBoard = data.board;
  drawBoard(currentBoard);
  document.getElementById("turn").innerText = data.whiteToMove
    ? "Lượt Trắng"
    : "Lượt Đen";
});

// Nếu đi sai
socket.on("invalid_move", (data) => {
  alert(data.msg);
});

// Hàm join room
function joinRoom() {
  const room = document.getElementById("roomInput").value;
  if (room) {
    currentRoom = room;
    socket.emit("join", { room: currentRoom });
    document.getElementById("status").innerText =
      "Đã tham gia phòng: " + currentRoom;
  }
}

// Vẽ bàn cờ
function drawBoard(board) {
  if (!boardDiv || !Array.isArray(board) || board.length !== 8) return;
  boardDiv.innerHTML = "";
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = document.createElement("div");
      square.classList.add("square");
      square.classList.add((row + col) % 2 === 0 ? "light" : "dark");
      square.dataset.row = row;
      square.dataset.col = col;

      const piece = board[row][col];
      if (piece !== "--") {
        const img = document.createElement("img");
        const imgSrc = `/static/images/${piece.toUpperCase()}.png`; // Đường dẫn khớp
        img.src = imgSrc;
        img.alt = piece;
        img.onload = () => console.log("Tải ảnh thành công:", imgSrc);
        img.onerror = () => {
          console.error("Lỗi tải ảnh:", imgSrc, "Fallback to default.png");
          img.src = "/static/images/default.png"; // Fallback
        };
        square.appendChild(img);
      }

      if (
        selectedSquare &&
        selectedSquare.row === row &&
        selectedSquare.col === col
      ) {
        square.style.outline = "3px solid blue";
      }

      square.addEventListener("click", () => handleClick(row, col));
      boardDiv.appendChild(square);
    }
  }
}

// Xử lý khi click ô
function handleClick(row, col) {
  if (!currentRoom) {
    alert("Bạn cần join room trước!");
    return;
  }
  if (selectedSquare) {
    if (selectedSquare.row === row && selectedSquare.col === col) {
      selectedSquare = null;
      drawBoard(currentBoard);
      return;
    }
    const from = selectedSquare;
    const to = { row, col };
    socket.emit("make_move", { room: currentRoom, from, to });
    selectedSquare = null; // Reset sau khi gửi
  } else {
    selectedSquare = { row, col };
    drawBoard(currentBoard);
  }
}

// Reset room
function resetBoard() {
  if (currentRoom) {
    socket.emit("reset", { room: currentRoom });
  }
}

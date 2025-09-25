const boardDiv = document.getElementById("chessboard");
let selectedSquare = null;
let currentBoard = [];

// Khi load trang, reset bàn cờ
window.onload = () => {
  resetBoard();
};

// Vẽ bàn cờ với dữ liệu từ backend
function drawBoard(board) {
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
        img.src = `/images/${piece}.png`; // load ảnh từ thư mục images/
        square.appendChild(img);
      }

      square.addEventListener("click", () => handleClick(row, col));
      boardDiv.appendChild(square);
    }
  }
}

// Xử lý click chọn quân
function handleClick(row, col) {
  if (selectedSquare == null) {
    selectedSquare = { row, col };
  } else {
    fetch("/move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: selectedSquare, to: { row, col } }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "ok") {
          currentBoard = data.board;
          drawBoard(currentBoard);
        }
      });
    selectedSquare = null;
  }
}

// Nước đi AI
function aiMove() {
  fetch("/ai-move")
    .then((res) => res.json())
    .then((data) => {
      currentBoard = data.board;
      drawBoard(currentBoard);
    });
}

// Reset bàn cờ
function resetBoard() {
  fetch("/reset", { method: "POST" })
    .then((res) => res.json())
    .then((data) => {
      currentBoard = data.board;
      drawBoard(currentBoard);
    });
}

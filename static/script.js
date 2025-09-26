const boardDiv = document.getElementById("chessboard");
let selectedSquare = null;
let currentBoard = [];

// Bảng khởi tạo mặc định (same format as your backend board)
const localStartBoard = [
  ["bR", "bN", "bB", "bQ", "bK", "bB", "bN", "bR"],
  ["bp", "bp", "bp", "bp", "bp", "bp", "bp", "bp"],
  ["--", "--", "--", "--", "--", "--", "--", "--"],
  ["--", "--", "--", "--", "--", "--", "--", "--"],
  ["--", "--", "--", "--", "--", "--", "--", "--"],
  ["--", "--", "--", "--", "--", "--", "--", "--"],
  ["wp", "wp", "wp", "wp", "wp", "wp", "wp", "wp"],
  ["wR", "wN", "wB", "wQ", "wK", "wB", "wN", "wR"],
];

// Khi load trang: thử gọi backend /reset. Nếu thất bại (không có backend) -> dùng localStartBoard
window.onload = () => {
  // Try to initialize from backend (works when Flask is running)
  fetch("/reset", { method: "POST" })
    .then((res) => {
      if (!res.ok) throw new Error("No backend");
      return res.json();
    })
    .then((data) => {
      currentBoard = data.board;
      drawBoard(currentBoard);
      updateTurnDisplay(data.whiteToMove);
    })
    .catch((err) => {
      // Fallback to static demo board
      currentBoard = localStartBoard;
      drawBoard(currentBoard);
      updateTurnDisplay(true); // white to move initially
      console.log("Backend not available — using static demo board.");
    });
};

function updateTurnDisplay(whiteToMove) {
  const el = document.getElementById("turn");
  if (el) el.innerText = whiteToMove ? "White's turn" : "Black's turn";
}

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
        // ĐƯỜNG DẪN TƯƠNG ĐỐI: KHÔNG DẤU / Ở ĐẦU
        img.src = `images/${piece}.png`;
        img.onerror = () => {
          img.style.display = "none";
        }; // nếu thiếu ảnh thì ẩn
        square.appendChild(img);
      }

      // highlight selected square
      if (
        selectedSquare &&
        selectedSquare.row === row &&
        selectedSquare.col === col
      ) {
        square.style.outline = "3px solid rgba(0,0,255,0.6)";
      }

      square.addEventListener("click", () => handleClick(row, col));
      boardDiv.appendChild(square);
    }
  }
}

// Xử lý click: nếu backend có thì gửi move, nếu không -> demo tĩnh (chỉ swap piece, không kiểm tra luật)
function handleClick(row, col) {
  if (selectedSquare == null) {
    selectedSquare = { row, col };
    drawBoard(currentBoard);
  } else {
    const from = selectedSquare;
    const to = { row, col };

    // Thử gửi đến backend; nếu backend không có thì chỉ swap (demo)
    fetch("/move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: from, to: to }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("No backend or invalid move");
        return res.json();
      })
      .then((data) => {
        if (data.status === "ok") {
          currentBoard = data.board;
          drawBoard(currentBoard);
          updateTurnDisplay(data.whiteToMove);
        } else {
          // invalid move: ignore or show message
          alert("Invalid move (backend)");
        }
      })
      .catch((err) => {
        // Demo fallback: đơn giản swap pieces (không kiểm tra hợp lệ)
        const piece = currentBoard[from.row][from.col];
        currentBoard[from.row][from.col] = "--";
        currentBoard[to.row][to.col] = piece;
        drawBoard(currentBoard);
        // switch turn indicator for demo
        const turnEl = document.getElementById("turn");
        if (turnEl) {
          turnEl.innerText = turnEl.innerText.includes("White")
            ? "Black's turn"
            : "White's turn";
        }
        console.log("Move applied locally (demo fallback).");
      });

    selectedSquare = null;
  }
}

function aiMove() {
  fetch("/ai-move")
    .then((res) => {
      if (!res.ok) throw new Error("No backend");
      return res.json();
    })
    .then((data) => {
      currentBoard = data.board;
      drawBoard(currentBoard);
      updateTurnDisplay(data.whiteToMove);
    })
    .catch((err) => {
      alert("AI move requires backend. On static demo AI not available.");
    });
}

function resetBoard() {
  fetch("/reset", { method: "POST" })
    .then((res) => {
      if (!res.ok) throw new Error("No backend");
      return res.json();
    })
    .then((data) => {
      currentBoard = data.board;
      drawBoard(currentBoard);
      updateTurnDisplay(data.whiteToMove);
    })
    .catch((err) => {
      currentBoard = localStartBoard;
      drawBoard(currentBoard);
      updateTurnDisplay(true);
      console.log("Reset fallback to local start board.");
    });
}

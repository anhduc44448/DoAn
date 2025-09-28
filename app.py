from flask import Flask, render_template, send_from_directory
from flask_socketio import SocketIO, emit, join_room
import os
import copy

# ==============================
# Khởi tạo Flask + SocketIO
# ==============================
app = Flask(__name__, static_folder="static", template_folder=".")
socketio = SocketIO(app, cors_allowed_origins="*")

# ==============================
# Game State đơn giản
# ==============================
class GameState:
    def __init__(self):
        # Bàn cờ mặc định
        self.board = [
            ["bR", "bN", "bB", "bQ", "bK", "bB", "bN", "bR"],
            ["bp", "bp", "bp", "bp", "bp", "bp", "bp", "bp"],
            ["--", "--", "--", "--", "--", "--", "--", "--"],
            ["--", "--", "--", "--", "--", "--", "--", "--"],
            ["--", "--", "--", "--", "--", "--", "--", "--"],
            ["--", "--", "--", "--", "--", "--", "--", "--"],
            ["wp", "wp", "wp", "wp", "wp", "wp", "wp", "wp"],
            ["wR", "wN", "wB", "wQ", "wK", "wB", "wN", "wR"],
        ]
        self.white_to_move = True

    def make_move(self, from_pos, to_pos):
        """Di chuyển quân cờ"""
        fr, fc = from_pos["row"], from_pos["col"]
        tr, tc = to_pos["row"], to_pos["col"]

        piece = self.board[fr][fc]
        if piece == "--":
            return False

        # Đơn giản hóa: cho phép đi bất kỳ (không check luật)
        self.board[tr][tc] = piece
        self.board[fr][fc] = "--"
        self.white_to_move = not self.white_to_move
        return True

# ==============================
# Quản lý nhiều phòng
# ==============================
game_states = {}

# ==============================
# Routes
# ==============================
@app.route("/")
def index():
    return send_from_directory(".", "index.html")

# ==============================
# SocketIO Events
# ==============================
@socketio.on("join")
def on_join(data):
    room = data["room"]
    join_room(room)
    if room not in game_states:
        game_states[room] = GameState()
    gs = game_states[room]
    emit("board_update", {"board": gs.board, "whiteToMove": gs.white_to_move}, room=room)

@socketio.on("make_move")
def on_make_move(data):
    room = data["room"]
    gs = game_states.get(room)
    if not gs:
        return

    success = gs.make_move(data["from"], data["to"])
    if success:
        emit("board_update", {"board": gs.board, "whiteToMove": gs.white_to_move}, room=room)
    else:
        emit("invalid_move", {"msg": "❌ Nước đi không hợp lệ!"}, to=request.sid)

@socketio.on("reset")
def on_reset(data):
    room = data["room"]
    game_states[room] = GameState()
    gs = game_states[room]
    emit("board_update", {"board": gs.board, "whiteToMove": gs.white_to_move}, room=room)

# ==============================
# Run server
# ==============================
if __name__ == "__main__":
    # Mở cho tất cả IP (LAN / internet)
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
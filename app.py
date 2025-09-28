from flask import Flask, send_from_directory
from flask_socketio import SocketIO, emit, join_room
import os
import copy
from ChessEngine import GameState, Move  # Import đúng lớp và Move

app = Flask(__name__, static_folder="static", template_folder=".")
socketio = SocketIO(app, cors_allowed_origins="*")

class CustomGameState:
    def __init__(self):
        self.game_state = GameState()  # Sử dụng GameState từ ChessEngine
        self.white_to_move = True

    def make_move(self, from_pos, to_pos):
        # Chuyển đổi định dạng từ dict sang tuple cho Move
        move = Move(
            (from_pos["row"], from_pos["col"]),
            (to_pos["row"], to_pos["col"]),
            self.game_state.board
        )
        # Kiểm tra nước đi hợp lệ
        valid_moves = self.game_state.getValidMoves()
        if move in valid_moves:
            self.game_state.makeMove(move)
            self.white_to_move = not self.white_to_move
            return True
        return False

    def get_board(self):
        # Trả về bảng cờ hiện tại
        return self.game_state.board

game_states = {}

@app.route("/")
def index():
    return send_from_directory(".", "index.html")

@app.route('/static/<path:filename>')
def serve_static(filename):
    try:
        return send_from_directory('static', filename)
    except FileNotFoundError:
        print(f"Error: File not found - static/{filename}")
        return "File not found", 404

@socketio.on("join")
def on_join(data):
    room = data["room"]
    join_room(room)
    if room not in game_states:
        game_states[room] = CustomGameState()
    gs = game_states[room]
    emit("board_update", {"board": gs.get_board(), "whiteToMove": gs.white_to_move}, room=room)

@socketio.on("make_move")
def on_make_move(data):
    room = data["room"]
    gs = game_states.get(room)
    if not gs:
        return
    success = gs.make_move(data["from"], data["to"])
    if success:
        emit("board_update", {"board": gs.get_board(), "whiteToMove": gs.white_to_move}, room=room)
    else:
        emit("invalid_move", {"msg": "❌ Nước đi không hợp lệ!"}, to=request.sid)

@socketio.on("reset")
def on_reset(data):
    room = data["room"]
    game_states[room] = CustomGameState()
    gs = game_states[room]
    emit("board_update", {"board": gs.get_board(), "whiteToMove": gs.white_to_move}, room=room)

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
from flask import Flask, request, jsonify, render_template, send_from_directory
from ChessEngine import GameState, Move
import ChessAI

# Khai báo template_folder="." để Flask tìm index.html ngay ngoài gốc
app = Flask(__name__, template_folder=".")

# Trạng thái game toàn cục
game_state = GameState()


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/images/<path:filename>")
def images(filename):
    return send_from_directory("images", filename)


@app.route("/reset", methods=["POST"])
def reset():
    global game_state
    game_state = GameState()
    return jsonify({"status": "reset", "board": game_state.board})


@app.route("/move", methods=["POST"])
def move():
    data = request.json
    start = (data["from"]["row"], data["from"]["col"])
    end = (data["to"]["row"], data["to"]["col"])
    move = Move(start, end, game_state.board)
    valid_moves = game_state.getValidMoves()

    if move in valid_moves:
        game_state.makeMove(move)
        return jsonify({"status": "ok", "board": game_state.board})
    else:
        return jsonify({"status": "invalid"})


@app.route("/ai-move", methods=["GET"])
def ai_move():
    valid_moves = game_state.getValidMoves()
    move = ChessAI.findRandomMove(valid_moves)
    if move:
        game_state.makeMove(move)
    return jsonify({"board": game_state.board})


if __name__ == "__main__":
    app.run(debug=True)

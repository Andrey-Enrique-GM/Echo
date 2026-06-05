import os
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from core.characters import PERSONAJES
from core.chat_manager import ChatManager

load_dotenv()

app = Flask(__name__)
# Usamos una clave simple para desarrollo local
app.secret_key = os.getenv("SECRET_KEY", "dev_secret_123")

# Instancia global del manager para la prueba local
chat_manager = ChatManager()

@app.route('/')
def index():
    """Vista principal: Renderiza el menú de selección de personajes."""
    return render_template('index.html', personajes=PERSONAJES)

@app.route('/seleccionar', methods=['POST'])
def seleccionar():
    """Endpoint para elegir personaje y obtener su saludo inicial."""
    data = request.json or {}
    id_personaje = data.get('personaje')
    
    if not id_personaje or id_personaje not in PERSONAJES:
        return jsonify({"status": "error", "message": "Personaje no válido"}), 400
        
    try:
        resultado = chat_manager.seleccionar_personaje(id_personaje)
        return jsonify({
            "status": "success",
            "respuesta": resultado["respuesta"],
            "emocion": resultado["emocion"],
            "personaje": id_personaje
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/enviar', methods=['POST'])
def enviar():
    """Endpoint para procesar los mensajes del chat."""
    data = request.json or {}
    mensaje = data.get('mensaje')
    
    if not mensaje:
        return jsonify({"status": "error", "message": "Mensaje vacío"}), 400
        
    try:
        resultado = chat_manager.avanzar_conversacion(mensaje)
        return jsonify(resultado)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)

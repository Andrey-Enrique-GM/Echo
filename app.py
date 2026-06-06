from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from core.characters import PERSONAJES
from core.chat_manager import ChatManager
import os



# Cargar las variables de entorno desde el archivo .env
load_dotenv()

# Configuración de la aplicación Flask
app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY")

# Inicializar el ChatManager, que se encargará de la lógica del chat y la interacción con la IA
chat_manager = ChatManager()



# Ruta principal que muestra el menú de selección de personajes
@app.route('/')
def index():
    """Vista principal: Renderiza el menú de selección de personajes."""
    return render_template('index.html', personajes=PERSONAJES)


# Endpoint para seleccionar un personaje y obtener su saludo inicial
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


# Endpoint para enviar mensajes al chat y obtener respuestas del personaje seleccionado
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



# Ejecutar la aplicación Flask
if __name__ == '__main__':
    app.run()

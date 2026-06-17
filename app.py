from flask import Flask, redirect, render_template, request, jsonify
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



# Ruta principal que muestra el menú principal
@app.route('/')
def index():
    """Vista principal: Renderiza el menú de inicio."""
    return render_template('index.html')


# Ruta para la pantalla de selección de personajes
@app.route('/menu')
def menu():
    """Vista del menú: Renderiza el menú de selección de personajes."""
    return render_template('menu.html', personajes=PERSONAJES)


# Ruta para la pantalla de chat, donde se desarrolla el roleplay
@app.route('/chat')
def chat_view():
    """Vista del Roleplay: Renderiza la pantalla del chat (chat.html)."""
    # Si intentan entrar a /chat sin haber elegido un personaje, los mandamos al menú
    if not chat_manager.personaje_actual:
        return redirect('/')
    
    id_p = chat_manager.personaje_actual
    
    # Obtenemos el último mensaje del historial (que será el saludo generado en /seleccionar)
    # Si por alguna razón está vacío, dejamos un saludo genérico de respaldo
    saludo = chat_manager.historial[-1]["text"] if chat_manager.historial else "¡Hola!"
    
    return render_template(
        'chat.html', 
        id_personaje=id_p,
        saludo_inicial=saludo,
        emocion_inicial="neutral" # Arranca en neutral por defecto
    )


# Endpoint para seleccionar un personaje y obtener su saludo inicial
@app.route('/seleccionar', methods=['POST'])
def seleccionar():
    """Endpoint para elegir personaje y obtener su saludo inicial."""
    data = request.json or {}
    id_personaje = data.get('personaje')
    
    if not id_personaje or id_personaje not in PERSONAJES:
        return jsonify({"status": "error", "message": "Personaje no válido"}), 400
        
    try:
        # El manager inicializa el bot y guarda el saludo en memoria viva
        chat_manager.seleccionar_personaje(id_personaje)
        return jsonify({"status": "success"})
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

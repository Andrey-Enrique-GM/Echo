import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv

class IAClient:
    """Cliente encargado de la comunicación directa con la API de Inteligencia Artificial de Gemini."""


    def __init__(self):
        """Inicializa el cliente de Gemini usando las variables de entorno."""
        # Asegúrate de tener GEMINI_API_KEY en tu .env
        self.client = genai.Client()
        # Usamos el modelo rápido y optimizado para texto y JSON
        self.model_name = "gemini-2.5-flash"


    def enviar_mensaje(self, prompt_sistema: str, historial: list, mensaje_usuario: str) -> dict:
        """
        Envía el historial de chat y el nuevo mensaje a Gemini, forzando una respuesta en JSON.
        
        :param prompt_sistema: Las instrucciones de rol del personaje.
        :param historial: Lista de mensajes anteriores.
        :param mensaje_usuario: El último texto enviado por el usuario.
        :return: Dict con las llaves 'respuesta' y 'emocion'.
        """
        # Formateamos el historial para el formato que espera la API
        contents = []
        for msg in historial:
            contents.append(
                types.Content(
                    role=msg["role"],
                    parts=[types.Part.from_text(text=msg["text"])]
                )
            )
        
        # Añadimos el nuevo mensaje del usuario
        contents.append(
            types.Content(role="user", parts=[types.Part.from_text(text=mensaje_usuario)])
        )

        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=prompt_sistema,
                    # Forzamos a la IA a responder estrictamente en JSON válido
                    response_mime_type="application/json",
                    temperature=0.7,
                ),
            )
            
            # Parseamos la cadena JSON que devuelve la IA a un diccionario de Python
            return json.loads(response.text)
            
        except Exception as e:
            print(f"Error en la API de Gemini: {e}")
            return {
                "respuesta": "Lo siento, me distraje un momento... ¿Qué decías?",
                "emocion": "confundida"
            }
        
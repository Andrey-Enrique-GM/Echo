from groq import Groq
from dotenv import load_dotenv
import os
import json

class IAClient:
    """Cliente encargado de la comunicación directa con la API de Inteligencia Artificial de Groq."""


    def __init__(self):
        """Inicializa el cliente de Groq usando las variables de entorno."""
        # Al dejarlo vacío, Groq busca automáticamente la variable GROQ_API_KEY en tu archivo .env
        self.client = Groq()
        # Usamos el modelo rápido, optimizado y con un límite gratuito muy amplio
        self.model_name = "llama-3.1-8b-instant"


    def enviar_mensaje(self, prompt_sistema: str, historial: list, mensaje_usuario: str) -> dict:
        """
        Envía el historial de chat y el nuevo mensaje a Groq, forzando una respuesta en JSON.
        
        :param prompt_sistema: Las instrucciones de rol del personaje.
        :param historial: Lista de mensajes anteriores.
        :param mensaje_usuario: El último texto enviado por el usuario.
        :return: Dict con las llaves 'respuesta' y 'emocion'.
        """
        # Formateamos el historial al estándar simple que usa Groq (role y content)
        messages = []
        
        # Primero añadimos el prompt del sistema (instrucciones del chatbot)
        messages.append({
            "role": "system",
            "content": prompt_sistema
        })
        
        # Mapeamos tu historial
        # Cada mensaje del historial es un dict con 'role' (user/model) y 'text', lo convertimos al formato que espera Groq
        for msg in historial:
            messages.append({
                "role": msg["role"],
                "content": msg["text"]
            })
        
        # Añadimos el nuevo mensaje del usuario al final
        messages.append({
            "role": "user",
            "content": mensaje_usuario
        })

        try:
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                temperature=0.7,
                # Forzamos que la respuesta sea estrictamente un objeto JSON válido
                response_format={"type": "json_object"}
            )
            
            # El contenido de la respuesta se encuentra en choices[0].message.content
            respuesta_texto = response.choices[0].message.content
            
            # Parseamos la cadena JSON que devuelve la IA a un diccionario de Python
            return json.loads(respuesta_texto)
            
        except Exception as e:
            print(f"Error en la API de Groq: {e}")
            return {
                "respuesta": "Lo siento, me distraje un momento... ¿Qué decías?",
                "emocion": "confundida"
            }
        
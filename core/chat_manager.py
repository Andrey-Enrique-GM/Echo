from core.characters import PERSONAJES
from core.ia_client import IAClient

class ChatManager:
    """Gestiona el flujo de la conversación, el historial de chat y las identidades."""


    def __init__(self):
        self.ia_client = IAClient()
        # Diccionario para almacenar el historial de la sesión activa en memoria
        # Estructura: { "role": "user"|"model", "text": "..." }
        self.historial = []
        self.personaje_actual = None


    def seleccionar_personaje(self, id_personaje: str) -> dict:
        """
        Configura el personaje activo e inicia la conversación con su saludo inicial.
        """
        if id_personaje not in PERSONAJES:
            raise ValueError("Personaje no encontrado")
            
        self.personaje_actual = id_personaje
        self.historial = [] # Limpiamos historial previo, si existía
        
        info = PERSONAJES[id_personaje]
        
        # Le pedimos a la IA que genere el saludo inicial basado en su prompt_sistema
        primer_contacto = self.ia_client.enviar_mensaje(
            prompt_sistema=info["prompt_sistema"],
            historial=self.historial,
            mensaje_usuario="Preséntate y salúdame de acuerdo a tu rol de manera natural."
        )
        
        # Guardamos el saludo del asistente en nuestro historial interno
        self.historial.append({"role": "assistant", "text": primer_contacto["respuesta"]})
        
        return primer_contacto


    def avanzar_conversacion(self, mensaje_usuario: str) -> dict:
        """
        Registra el mensaje del usuario y obtiene la respuesta estructurada del personaje.
        """
        if not self.personaje_actual:
            raise RuntimeError("No se ha seleccionado ningún personaje.")
            
        info = PERSONAJES[self.personaje_actual]
        
        # Primero guardamos el mensaje del usuario en el historial local
        self.historial.append({"role": "user", "text": mensaje_usuario})

        # 1. Obtener respuesta de la IA
        resultado = self.ia_client.enviar_mensaje(
            prompt_sistema=info["prompt_sistema"],
            historial=self.historial,
            mensaje_usuario=mensaje_usuario
        )
        
        # 2. Añadimos la respuesta de la IA usando el rol "assistant"
        self.historial.append({"role": "assistant", "text": resultado["respuesta"]})
        
        return resultado
    
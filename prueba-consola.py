# prueba_consola.py
import os
from dotenv import load_dotenv
from core.chat_manager import ChatManager

def main():
    # 1. Cargar las variables de entorno (.env) para la API Key
    load_dotenv()
    
    if not os.getenv("GEMINI_API_KEY"):
        print("Error: No se encontró la variable GEMINI_API_KEY en el archivo .env")
        return

    print("Inicializando ChatManager y conectando con Gemini...")
    manager = ChatManager()
    
    # 2. Seleccionar automáticamente a Sayori para la prueba
    # (Si quieres probar con Akira, solo cambia "sayori" por "akira")
    personaje_id = "sayori"
    
    print(f"Iniciando rol con: {personaje_id.upper()}\n")
    print("-" * 50)
    
    # 3. Obtener el saludo inicial del personaje
    try:
        primer_contacto = manager.seleccionar_personaje(personaje_id)
        # Imprimimos el saludo inicial en consola
        print(f"{personaje_id.upper()}: {primer_contacto['respuesta']}")
    except Exception as e:
        print(f"Ocurrió un error al iniciar el personaje: {e}")
        return

    # 4. Bucle infinito para la conversación en tiempo real
    while True:
        try:
            # Capturar lo que escribes en la terminal
            usuario_input = input("YOU: ")
                
            if not usuario_input.strip():
                continue
                
            # Enviar tu mensaje al manager y esperar la respuesta estructurada
            resultado = manager.avanzar_conversacion(usuario_input)
            
            # Imprimir la respuesta de la IA
            print(f"{personaje_id.upper()}: {resultado['respuesta']}")
            
            # Imprimimos la emoción en pequeño para comprobar que la detecta bien
            print(f"   [Emoción detectada: {resultado['emocion']}]")
            
        except Exception as e:
            print(f"\nError durante la conversación: {e}")
            break

if __name__ == "__main__":
    main()
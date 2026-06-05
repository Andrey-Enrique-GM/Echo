let personajeActivo = "";

/**
 * Envía el personaje seleccionado al servidor y cambia a la vista de chat.
 */
async function seleccionarPersonaje(idPersonaje) {
    try {
        const response = await fetch('/seleccionar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ personaje: idPersonaje })
        });
        
        const data = await response.json();
        
        if (data.status === "success") {
            personajeActivo = data.personaje;
            
            // Intercambiar las vistas de la app
            document.getElementById('menu-seleccion').style.display = 'none';
            document.getElementById('pantalla-roleplay').style.display = 'block';
            
            // Cargar la imagen inicial y el texto devuelto por la IA
            actualizarInterfaz(data.respuesta, data.emocion);
        } else {
            alert("Error al seleccionar personaje: " + data.message);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

/**
 * Captura el texto del usuario, lo envía a Flask y procesa la respuesta del personaje.
 */
async function enviarMensaje() {
    const input = document.getElementById('input-mensaje');
    const mensaje = input.value.trim();
    
    if (!mensaje) return;

    // Limpiamos el input inmediatamente para dar fluidez
    input.value = '';
    document.getElementById('globo-texto').innerText = "Escribiendo...";

    try {
        const response = await fetch('/enviar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mensaje: mensaje })
        });

        const data = await response.json();
        
        if (data.respuesta) {
            // Actualizar interfaz con la nueva emoción e imagen
            actualizarInterfaz(data.respuesta, data.emocion);
        } else {
            document.getElementById('globo-texto').innerText = "Error al recibir respuesta.";
        }
    } catch (error) {
        console.error("Error:", error);
        document.getElementById('globo-texto').innerText = "Error de conexión.";
    }
}

/**
 * Modifica dinámicamente el globo de texto y la ruta de la imagen del personaje.
 */
function actualizarInterfaz(texto, emocion) {
    // 1. Actualizar texto de la IA
    document.getElementById('globo-texto').innerText = texto;
    
    // 2. Resolver la ruta de la imagen de forma dinámica basada en tus carpetas
    // Ejemplo: /static/images/characters/sayori/sayori-confundida.png
    const imgElement = document.getElementById('avatar-personaje');
    const nuevaRuta = `/static/images/characters/${personajeActivo}/${personajeActivo}-${emocion}.png`;
    
    imgElement.src = nuevaRuta;
}
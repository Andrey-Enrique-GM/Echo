// Obtener el ID del personaje directamente desde el HTML inyectado por Flask
const avatarImg = document.getElementById('avatar-personaje');
const personajeActivo = avatarImg ? avatarImg.getAttribute('data-personaje') : "";


/**
 * Envía el personaje seleccionado y redirige a la página de chat
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
            window.location.href = '/chat';
        } else {
            alert("Error al seleccionar personaje: " + data.message);
        }
    } catch (error) {
        console.error("Error en la selección:", error);
    }
}


/**
 * Captura el texto del usuario, lo envía a Flask y procesa la respuesta del personaje.
 */
async function enviarMensaje() {
    const input = document.getElementById('input-mensaje');
    const mensaje = input.value.trim();
    
    if (!mensaje) return;

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
    document.getElementById('globo-texto').innerText = texto;
    
    if (avatarImg) {
        const nuevaRuta = `/static/images/characters/${personajeActivo}/${personajeActivo}-${emocion}.png`;
        avatarImg.src = nuevaRuta;
    }
}

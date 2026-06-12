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
 * Procesa el texto para convertir *acciones* en Negrita + Cursiva
 */
function formatearTextoRoleplay(texto) {
    // Busca texto entre asteriscos y lo envuelve en tags HTML de estilo
    return texto.replace(/\*(.*?)\*/g, '<strong><em>*$1*</em></strong>');
}


/**
 * Captura el texto del usuario, lo envia a Flask, crea su burbuja de inmediato y consulta a la IA.
 */
async function enviarMensaje() {
    const input = document.getElementById('input-mensaje');
    const mensaje = input.value.trim();
    
    if (!mensaje) return;

    // 1. Limpiar el input
    input.value = '';
    
    // 2. Renderizar el mensaje del usuario en el historial
    const historial = document.getElementById('historial-chat');
    const usuarioBloque = document.createElement('div');
    usuarioBloque.classList.add('mensaje-bloque', 'usuario-msg');
    
    // Formateamos por si el usuario también escribe acciones entre asteriscos
    const textoFormateadoUser = formatearTextoRoleplay(mensaje);
    usuarioBloque.innerHTML = `
        <span class="nombre-etiqueta">You</span>
        <div class="burbuja-texto-rp">${textoFormateadoUser}</div>
    `;
    historial.appendChild(usuarioBloque);
    
    // Scroll inmediato con delay para asegurar la posición
    setTimeout(() => { historial.scrollTop = historial.scrollHeight; }, 50);

    // 3. Crear indicador temporal de "Escribiendo..."
    const escribiendoBloque = document.createElement('div');
    escribiendoBloque.id = 'indicador-escribiendo';
    escribiendoBloque.classList.add('mensaje-bloque', 'personaje-msg');
    escribiendoBloque.innerHTML = `
        <span class="nombre-etiqueta">${personajeActivo.charAt(0).toUpperCase() + personajeActivo.slice(1)}</span>
        <div class="burbuja-texto-rp"><i>Escribiendo...</i></div>
    `;
    historial.appendChild(escribiendoBloque);
    historial.scrollTop = historial.scrollHeight;

    try {
        const response = await fetch('/enviar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mensaje: mensaje })
        });

        const data = await response.json();
        
        // Quitar indicador de carga
        const indicador = document.getElementById('indicador-escribiendo');
        if (indicador) indicador.remove();

        if (data.respuesta) {
            actualizarInterfaz(data.respuesta, data.emocion);
        } else {
            alert("Error al recibir respuesta de la IA.");
        }
    } catch (error) {
        console.error("Error:", error);
        const indicador = document.getElementById('indicador-escribiendo');
        if (indicador) indicador.remove();
    }
}


/**
 * Añade la respuesta de la IA al historial con su respectivo formato y cambia la emoción.
 */
function actualizarInterfaz(texto, emocion) {
    const historial = document.getElementById('historial-chat');
    if (!historial) return;

    // Crear el bloque de mensaje formateado para el personaje
    const personajeBloque = document.createElement('div');
    personajeBloque.classList.add('mensaje-bloque', 'personaje-msg');
    
    // Aplicamos el formateador de asteriscos antes de insertar al HTML
    const textoFormateado = formatearTextoRoleplay(texto);

    const nombreFormateado = personajeActivo.charAt(0).toUpperCase() + personajeActivo.slice(1);

    personajeBloque.innerHTML = `
        <span class="nombre-etiqueta">${nombreFormateado}</span>
        <div class="burbuja-texto-rp">${textoFormateado}</div>
    `;
    
    historial.appendChild(personajeBloque);
    
    // Espera a que el DOM se dibuje al 100%
    setTimeout(() => {
        historial.scrollTop = historial.scrollHeight;
    }, 100);
    
    // Cambiar sprite de emoción
    if (avatarImg) {
        const nuevaRuta = `/static/images/characters/${personajeActivo}/${personajeActivo}-${emocion}.png`;
        avatarImg.src = nuevaRuta;
    }
}


/**
 * --- EFECTO DE FONDOS ANIMADOS (BURBUJAS) ---
 */
function inicializarBurbujasProyecto() {
    const contenedor = document.getElementById("burbujas-container");
    
    // Si no estamos en el menú de selección, no hace nada
    if (!contenedor) return; 

    function crearBurbuja() {
        const div = document.createElement("div");
        div.classList.add("burbuja");
        div.style.left = `${Math.random() * 100}%`;
        const size = Math.random() * 15 + 10;
        div.style.width = `${size}px`;
        div.style.height = `${size}px`;
        div.style.animationDuration = `${Math.random() * 3 + 2}s`;
        contenedor.appendChild(div);

        // Control de limpieza de memoria
        div.addEventListener("animationend", () => {
            div.remove();
        });
    }

    setInterval(crearBurbuja, 300);
}

// Se ejecuta de forma segura al cargar la página
window.addEventListener("DOMContentLoaded", inicializarBurbujasProyecto);

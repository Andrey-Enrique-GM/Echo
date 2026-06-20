// Obtener el ID del personaje directamente desde el HTML inyectado por Flask
const avatarImg = document.getElementById('avatar-personaje');
const personajeActivo = avatarImg ? avatarImg.getAttribute('data-personaje') : "";
// Contenedor del escenario visual
const contenedorFondo = document.getElementById('contenedor-fondo-rp');

let fondoBloqueadoPorUsuario = false;


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
        
        const indicador = document.getElementById('indicador-escribiendo');
        if (indicador) indicador.remove();

        if (data.respuesta) {
            // Pasamos tres parámetros ahora: respuesta, emocion y escenario
            actualizarInterfaz(data.respuesta, data.emocion, data.escenario);
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
 * Añade la respuesta de la IA al historial con su respectivo formato y cambia la emoción de forma suave.
 */
function actualizarInterfaz(texto, emocion, escenarioIA) {
    const historial = document.getElementById('historial-chat');
    if (!historial) return;

    // 1. CONTROL AUTOMÁTICO DE EMOCIÓN (Avatar)
    if (avatarImg) {
        const nuevaRuta = `/static/images/characters/${personajeActivo}/${personajeActivo}-${emocion}.png`;
        
        // Convertimos la ruta actual a una URL relativa limpia para poder comparar correctamente
        const rutaActual = avatarImg.getAttribute('src');

        // SOLO cambiamos si la emoción nueva es distinta a la que ya está puesta
        if (rutaActual !== nuevaRuta) {
            // Creamos una imagen temporal que irá al frente con la nueva expresión
            const nuevaImgClone = document.createElement('img');
            nuevaImgClone.src = nuevaRuta;
            nuevaImgClone.style.position = 'absolute';
            nuevaImgClone.style.bottom = '0';
            nuevaImgClone.style.height = avatarImg.style.height || '95%';
            nuevaImgClone.style.objectFit = 'contain';
            nuevaImgClone.style.zIndex = '3';
            nuevaImgClone.style.opacity = '0';
            nuevaImgClone.style.transition = 'opacity 0.4s ease-in-out';

            // La añadimos al contenedor detrás del escenario
            avatarImg.parentElement.appendChild(nuevaImgClone);

            // Forzamos el reflow del navegador para que detecte la opacidad en 0 antes de la transición
            window.getComputedStyle(nuevaImgClone).opacity;

            // Hacemos aparecer la nueva imagen suavemente
            nuevaImgClone.style.opacity = '1';

            // Al terminar la transición, actualizamos el avatar original y limpiamos el clon
            setTimeout(() => {
                avatarImg.src = nuevaRuta;
                nuevaImgClone.remove();
            }, 400);
        }
    }

    // 2. CONTROL HÍBRIDO DE ESCENARIO (Fondo)
    if (!fondoBloqueadoPorUsuario && escenarioIA && contenedorFondo) {
        contenedorFondo.style.backgroundImage = `url('/static/images/backgrounds/bg-${escenarioIA}.png')`;
    }

    // 3. CREAR EL BLOQUE DE MENSAJE E INICIAR LA MÁQUINA DE ESCRIBIR
    const personajeBloque = document.createElement('div');
    personajeBloque.classList.add('mensaje-bloque', 'personaje-msg');
    
    const nombreFormateado = personajeActivo.charAt(0).toUpperCase() + personajeActivo.slice(1);

    personajeBloque.innerHTML = `
        <span class="nombre-etiqueta">${nombreFormateado}</span>
        <div class="burbuja-texto-rp"></div>
    `;
    
    historial.appendChild(personajeBloque);
    const burbujaTexto = personajeBloque.querySelector('.burbuja-texto-rp');
    
    efectoMaquinaEscribir(burbujaTexto, texto, 20, () => {
        burbujaTexto.innerHTML = formatearTextoRoleplay(texto);
    });
}


/**
 * Imprime texto enriquecido con HTML letra por letra en un contenedor específico.
 */
function efectoMaquinaEscribir(elemento, texto, velocidad = 20, callback = null) {
    elemento.innerHTML = ""; // Limpiamos el contenedor
    let i = 0;
    const historial = document.getElementById('historial-chat');
    
    function escribir() {
        if (i < texto.length) {
            elemento.textContent += texto.charAt(i); // Usamos textContent para evitar conflictos con caracteres especiales
            i++;
            
            if (historial) {
                historial.scrollTop = historial.scrollHeight;
            }
            
            setTimeout(escribir, velocidad);
        } else {
            // ¡Terminó de escribir! Ejecutamos el formateo final
            if (callback) callback();
        }
    }
    escribir();
}


/**
 * Abre el modal de selección de fondos
 */
function abrirModalFondos() {
    const modal = document.getElementById('modal-fondos');
    if (modal) modal.classList.add('activo');
}


/**
 * Cierra el modal de selección si se hace clic fuera del recuadro blanco
 */
function cerrarModalFondos(event) {
    if (event.target.classList.contains('modal-overlay')) {
        document.getElementById('modal-fondos').classList.remove('activo');
    }
}


/**
 * Cambia el fondo manualmente y bloquea la automatización
 */
function seleccionarFondoManual(nombreEscenario) {
    if (!contenedorFondo) return;
    
    // Cambiar la imagen de fondo
    contenedorFondo.style.backgroundImage = `url('/static/images/backgrounds/bg-${nombreEscenario}.png')`;
    
    // Activar el bloqueo
    fondoBloqueadoPorUsuario = true;
    
    // Cambiar el diseño del botón superior para indicar que está fijado
    const btnFondo = document.getElementById('btn-cambiar-fondo');
    if (btnFondo) {
        btnFondo.innerHTML = "📌";
        btnFondo.classList.add('fijado');
    }

    // Cerrar el modal
    document.getElementById('modal-fondos').classList.remove('activo');
}


/**
 * Devuelve el control a la IA para que cambie el escenario dinámicamente
 */
function liberarControlIA() {
    fondoBloqueadoPorUsuario = false;
    
    const btnFondo = document.getElementById('btn-cambiar-fondo');
    if (btnFondo) {
        btnFondo.innerHTML = "🖼️";
        btnFondo.classList.remove('fijado');
    }
    
    document.getElementById('modal-fondos').classList.remove('activo');
}


// Funciones para el Modal de Información de Proyecto
function abrirModalInfo() {
    const modal = document.getElementById('modal-info-proyecto');
    if (modal) {
        modal.classList.add('activo');
    }
}


function cerrarModalInfo() {
    const modal = document.getElementById('modal-info-proyecto');
    if (modal) {
        modal.classList.remove('activo');
    }
}


// Cierra el modal si el usuario hace clic fuera de la caja de contenido
function cerrarModalInfoExterno(event) {
    const modal = document.getElementById('modal-info-proyecto');
    if (event.target === modal) {
        cerrarModalInfo();
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

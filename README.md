# ECHO 🤖💬

Este es un proyecto de una aplicación web que simula una conversación interactiva (roleplay) en tiempo real con diferentes personajes ficticios. La aplicación cuenta con un menú de selección y un sistema dinámico donde los personajes cambian de expresión visual según el contexto y las emociones detectadas durante la conversación.

## ¿Cómo está hecho?
Es una aplicación web modular construida bajo el patrón de diseño de software MVC (Modelo-Vista-Controlador), separando la lógica de negocio de la presentación a través de las siguientes herramientas:
* **Python y Flask:** Para el servidor backend, el manejo de rutas, endpoints de comunicación asíncrona y el control de la sesión local.
* **HTML y CSS:** Para maquetar la interfaz visual en dos vistas (el menú de selección y el escenario de juego) utilizando un diseño limpio, plano y minimalista.
* **JavaScript:** Para manejar la comunicación asíncrona con el servidor, actualizar el globo de texto y alternar dinámicamente las rutas de las imágenes en el DOM sin recargar la página.
* **Variables de Entorno (.env):** Para la gestión segura de credenciales, tokens y llaves de API, aislando la configuración del código fuente mediante un archivo `.gitignore`.

## Servicios y Créditos
Para que este proyecto funcione de forma fluida y gratuita, se hace uso de los siguientes servicios externos y recursos artísticos:
* `Groq Cloud API`: Utilizado como el motor de Inteligencia Artificial principal para la generación de texto a gran velocidad. Se encarga de procesar el rol de los personajes y devolver las respuestas estructuradas nativamente en formato JSON (incluyendo el texto del diálogo y el tipo de emoción).
* `Sprites de Sayori (Doki Doki Literature Club)`: Todos los derechos de los diseños artísticos, expresiones y assets visuales del personaje Sayori pertenecen a **Dan Salvato** y al equipo de **Team Salvato**. Utilizados bajo fines puramente recreativos y de desarrollo personal.
* `Sprites de Misha (Katawa Shoujo)`: Todos los derechos de los diseños artísticos, expresiones y assets visuales del personaje Shiina Mikado (Misha) pertenecen al equipo de **Four Leaf Studios**. Utilizados bajo fines puramente recreativos y de desarrollo personal.
* `Sprites de Akira`: Los recursos gráficos utilizados para la identidad visual, expresiones y variantes del personaje Akira pertenecen a **Sitian** (yo), personaje original del WEBTOON **Musashi**.
* `Backgrounds`: Todos los derechos de las fotografias pertenecen a **Jinzou Tamashii** desde su perfil de DeviantArt. Utilizados bajo fines puramente recreativos y de desarrollo personal.
* `Efecto Burbujas`: Desarrollado originalmente por Ulises Basualdo.

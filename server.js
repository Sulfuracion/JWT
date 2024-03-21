// Se requiere el módulo dotenv para cargar variables de entorno desde un archivo .env
require('dotenv').config();

// Se importa y se inicializa Express
const express = require('express');
const app = express();

// Se importa el módulo jsonwebtoken para manejar tokens de autenticación JWT
const jwt = require('jsonwebtoken');

// Se indica a Express que utilice el middleware para parsear el cuerpo de las solicitudes en formato JSON
app.use(express.json());

// Array que simula una colección de publicaciones
const posts = [
    {
        username: 'david',
        title: 'post 1'
    },
    {
        username: 'juan',
        title: 'post 2'
    }
]

// Ruta para obtener las publicaciones de un usuario autenticado
app.get('/posts', authenticateToken, (req, res) => {
    // Se filtran las publicaciones para mostrar solo las del usuario autenticado
    res.json(posts.filter(post => post.username === req.user.name));
});

// Ruta para iniciar sesión y generar un token de acceso
app.post('/login', (req, res) => {
    // Se obtiene el nombre de usuario del cuerpo de la solicitud
    const username = req.body.username;
    // Se crea un objeto de usuario con el nombre de usuario obtenido
    const user = { name: username };
    // Se genera un token de acceso utilizando el nombre de usuario y la clave secreta almacenada en variables de entorno
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
    // Se devuelve el token de acceso como respuesta
    res.json({ accessToken: accessToken });
});

// Middleware para autenticar el token de acceso
function authenticateToken(req, res, next) {
    // Se obtiene el encabezado de autorización de la solicitud
    const authHeader = req.headers['authorization'];
    // Se verifica si existe el encabezado de autorización y se extrae el token de acceso
    const token = authHeader && authHeader.split(' ')[1];

    // Si no hay token, se devuelve un código de estado 401 (No autorizado)
    if (token == null) return res.sendStatus(401);

    // Se verifica el token de acceso utilizando la clave secreta almacenada en variables de entorno
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        // Si hay un error al verificar el token, se devuelve un código de estado 403 (Prohibido)
        if (err) return res.sendStatus(403);
        // Si la verificación es exitosa, se guarda el usuario en el objeto de solicitud y se pasa al siguiente middleware
        req.user = user;
        next();
    })
}

// Se inicia el servidor en el puerto 3000
app.listen(3000);

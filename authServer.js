// Carga las variables de entorno desde un archivo .env
require('dotenv').config()

// Importa y configura Express
const express = require('express')
const app = express()
// Importa el módulo jsonwebtoken para trabajar con JWT
const jwt = require('jsonwebtoken')

// Middleware que permite a Express entender JSON en las solicitudes
app.use(express.json())

// Array para almacenar los tokens de actualización
let refreshTokens = []

// Ruta para solicitar un nuevo token de acceso utilizando un token de actualización
app.post('/token', (req, res) => {
    const refreshToken = req.body.token
    // Rechaza la solicitud si no se proporciona un token de actualización
    if (refreshToken == null) return res.sendStatus(401)
    // Rechaza la solicitud si el token de actualización no está en la lista de permitidos
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
    // Verifica el token de actualización y genera un nuevo token de acceso si es válido
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        const accessToken = generateAccessToken({ name: user.name })
        res.json({ accessToken: accessToken })
    })
})

// Ruta para desloguear al usuario eliminando su token de actualización
app.delete('/logout', (req, res) => {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token)
    res.sendStatus(204) // No Content
})

// Ruta para loguear al usuario y generar tokens de acceso y actualización
app.post('/login', (req, res) => {
    // Aquí se debería autenticar al usuario

    const username = req.body.username
    const user = { name: username }

    const accessToken = generateAccessToken(user)
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
    refreshTokens.push(refreshToken)
    res.json({ accessToken: accessToken, refreshToken: refreshToken })
})

// Función para generar un token de acceso con una duración corta
function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' })
}

// Inicia el servidor en el puerto 4000
app.listen(4000)

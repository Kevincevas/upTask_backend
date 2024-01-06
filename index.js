import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import conectarDB from './config/db.js'
import usuarioRoutes from './routes/usuarioRoutes.js'
import proyectoRoutes from './routes/proyectoRoutes.js';
import tareaRoutes from './routes/tareaRoutes.js';

const app = express();
app.use(express.json()); //procesar la informacion tipo json

//variables de entorno
dotenv.config()

//conexion a la dba de mongo
conectarDB()

//configurar CORS para la conexion entre el fron y el back
const whitelist = [process.env.FRONTEND_URL]
const corsOptions = {
    origin: function(origin, callback){
        if (whitelist.includes(origin)) {
            //puede consultar la api
            callback(null, true)
        } else {
            //no esta permitido
            callback(new Error('Error de Cors'))
        }
    }
}

app.use(cors(corsOptions))
// app.use(cors({
//     origin: '*'
// }))



//Routing
// app.get('/', (req, res) => {
//     res.send('Hola mundo')
// })
app.use('/api/usuarios', usuarioRoutes)
app.use('/api/proyectos', proyectoRoutes)
app.use('/api/tareas', tareaRoutes)

const PORT = process.env.PORT || 4000

const servidor = app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`)
})

// Socket.IO
import { Server } from 'socket.io'

const io = new Server(servidor, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.FRONTEND_URL,
    }
})

io.on('connection', (socket) => {
    console.log('Conectado a socket.io')
    
    // Definir los eventos del socket io
    socket.on('abrir proyecto', (proyecto) => {
        // Guardando la referencia de la pagina y sincronizar a los usuarios que se encuentre en el room
        socket.join(proyecto)
    })

    socket.on('nueva tarea', (tarea) => {
        const proyecto = tarea.proyecto
        socket.to(proyecto).emit('tarea agregada', tarea)
    })

    socket.on('tarea eliminada', tarea => {
        const proyecto = tarea.proyecto
        socket.to(proyecto).emit('tarea eliminada', tarea)
    })

    socket.on('editar tarea', tarea => {
        const proyecto = tarea.proyecto._id
        socket.to(proyecto).emit('tarea editada', tarea)
    })

    socket.on('cambiar estado', tarea => {
        const proyecto = tarea.proyecto._id
        socket.to(proyecto).emit('nuevo estado', tarea)
    })
})
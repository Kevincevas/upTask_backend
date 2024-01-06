import express from 'express'
import { autenticar, comprobarToken, confirmar, nuevoPassword, perfil, recuperarPassword, registrar } from '../controllers/usuarioController.js'
import checkAuth from '../middleware/checkAuth.js'

const router = express.Router()

//Autenticacion, Registro y Confirmacion de Usuarios
router.post('/', registrar) //crea un nuevo usuario
router.post('/login', autenticar) //autenticacion de usuario
router.get('/confirmar/:token', confirmar) //confirmar token usuario
router.post('/olvide-password', recuperarPassword)

router.route('/olvide-password/:token').get(comprobarToken).post(nuevoPassword)
// router.get('/recuperar-password/:token', comprobarToken)
// router.post('/recuperar-password/:token', nuevoPassword)

router.get('/perfil', checkAuth, perfil)



export default router
import Proyecto from "../models/Proyecto.js"
import Usuario from "../models/Usuario.js"


const obtenerProyectos = async(req, res) => {
    const proyectos = await Proyecto.find({
        '$or' : [
            {'colaboradores': {$in: req.usuario}},
            {'creador': {$in: req.usuario}},
        ]
    })
        // .where('creador')
        // .equals(req.usuario)
        .select('-tareas')  //buscando en la dba proyectos por usuario --- .select(): especificar que campo no se quiere llamar en la consulta
    res.json(proyectos)
}

const obtenerProyecto = async(req, res) => {
    const {id} = req.params
    const proyecto = await Proyecto.findById(id).populate({ path: 'tareas', populate: {path:'completado', select: "nombre email"} }).populate('colaboradores', 'nombre email')  //ver la info de quien completo la tarea

    if (!proyecto) {
        const error = new Error('No encontrado')
        return res.status(404).json({ msg: error.message })
    }

    //evitar que busque proyectos no creados por el usuario
    //permite ver el proyecto a los creadores y colaboradores
    if (proyecto.creador?.toString() !== req.usuario._id.toString() && !proyecto.colaboradores.some(colaborador => colaborador._id.toString() === req.usuario._id.toString()) ) {
        const error = new Error('Acción no válida')
        return res.status(401).json({ msg: error.message })
    }

    //Obtener las tareas del proyecto
    // const tareas = await Tarea.find().where('proyecto').equals(proyecto._id)    //buscando en la dba tareas por proyecto

    // res.json({
    //     proyecto,
    //     tareas,
    // })

    res.json(proyecto)
    
}

const nuevoProyecto = async(req, res) => {
    const proyecto = new Proyecto(req.body)
    proyecto.creador = req.usuario._id

    try {
        const proyectoAlmacenado = await proyecto.save() //guardando en la dba
        res.json(proyectoAlmacenado)
    } catch (error) {
        console.log(error)
    }
}

const editarProyecto = async(req, res) => {
    const {id} = req.params
    const proyecto = await Proyecto.findById(id)

    if (!proyecto) {
        const error = new Error('No encontrado')
        return res.status(404).json({ msg: error.message })
    }

    //evitar que edite proyectos no creados por el usuario
    if (proyecto.creador?.toString() !== req.usuario._id.toString()) {
        const error = new Error('Acción no válida')
        return res.status(401).json({ msg: error.message })
    }
    
    //si el usuario actualiza el campo que cambie o sino que use el de la dba
    proyecto.nombre = req.body.nombre || proyecto.nombre
    proyecto.descripcion = req.body.descripcion || proyecto.descripcion
    proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega
    proyecto.cliente = req.body.cliente || proyecto.cliente

    try {
        const proyectoAlmacenado = await proyecto.save()
        res.json(proyectoAlmacenado)
    } catch (error) {
        console.log(error)
    }

}

const eliminarProyecto = async(req, res) => {
    const {id} = req.params
    const proyecto = await Proyecto.findById(id)

    if (!proyecto) {
        const error = new Error('No encontrado')
        return res.status(404).json({ msg: error.message })
    }

    //evitar que elimine proyectos no creados por el usuario
    if (proyecto.creador?.toString() !== req.usuario._id.toString()) {
        const error = new Error('Acción no válida')
        return res.status(401).json({ msg: error.message })
    }

    try {
        await proyecto.deleteOne()
        res.json({msg: "Proyecto Eliminado"})
    } catch (error) {
        console.log(error)
    }
}

const buscarColaborador = async(req, res) => {
    const {email} = req.body
    const usuario = await Usuario.findOne({email}).select('-confirmado -createdAt -updatedAt -password -token -__v')

    if (!usuario) {
        const error = new Error('Usuario no encontrado')
        return res.status(404).json({msg: error.message})   
    }

    res.json(usuario)
}

const agregarColaborador = async(req, res) => {
    const proyecto = await Proyecto.findById(req.params.id)

    // Verificando que el proyecto exista
    if (!proyecto) {
        const error = new Error('Proyecto no encontrado')
        return res.status(404).json({msg: error.message})
    }
    
    if (proyecto.creador?.toString() !== req.usuario._id.toString()) {
        const error = new Error('Acción no válida')
        return res.status(404).json({msg: error.message})
    }

    const {email} = req.body
    const usuario = await Usuario.findOne({email}).select('-confirmado -createdAt -updatedAt -password -token -__v')

    if (!usuario) {
        const error = new Error('Usuario no encontrado')
        return res.status(404).json({msg: error.message})
    }

    // El colaborador no es el admin del proyecto
    if (proyecto.creador?.toString() === usuario._id.toString()) {
        const error = new Error('El creador del proyecto no puede ser colaborador')
        return res.status(404).json({msg: error.message})
    }

    // Revisar que no esté ya agregado al proyecto
    if (proyecto.colaboradores.includes(usuario._id)) {
        const error = new Error('El usuario ya pertenece al proyecto')
        return res.status(404).json({msg: error.message})
    }

    // esta bien, sse puede agregar
    proyecto.colaboradores.push(usuario._id);
    await proyecto.save()
    res.json({msg: 'Colaborador Agregado Correctamente'})
}

const eliminarColaborador = async(req, res) => {
    const proyecto = await Proyecto.findById(req.params.id)

    // Verificando que el proyecto exista
    if (!proyecto) {
        const error = new Error('Proyecto no encontrado')
        return res.status(404).json({msg: error.message})
    }
    
    if (proyecto.creador?.toString() !== req.usuario._id.toString()) {
        const error = new Error('Acción no válida')
        return res.status(404).json({msg: error.message})
    }

    // esta bien, sse puede eliminar
    proyecto.colaboradores.pull(req.body.id);
    await proyecto.save()
    res.json({msg: 'Colaborador Eliminado Correctamente'})
}

export {
    obtenerProyectos,
    obtenerProyecto,
    nuevoProyecto,
    editarProyecto,
    eliminarProyecto,
    buscarColaborador,
    agregarColaborador,
    eliminarColaborador,
}
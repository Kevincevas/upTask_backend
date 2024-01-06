import mongoose from "mongoose";

const tareaSchema = new mongoose.Schema({
    nombre: {
        type: String,
        trim: true,
        required: true,
    },
    descripcion: {
        type: String,
        trim: true,
        required: true,
    },
    estado: {
        type: Boolean,
        default: false,
    },
    fechaEntrega: {
        type: Date,
        required: true,
        default: Date.now(),
    },
    prioridad: {
        type: String,
        required: true,
        enum: ['Baja', 'Media', 'Alta'],
    },
    proyecto: {
        type: mongoose.Schema.Types.ObjectId,    //referencia con proyectos para saber que tarea tiene cada proyecto
        ref: 'Proyecto',
    },
    completado: {
        type: mongoose.Schema.Types.ObjectId,    //referencia para saber que usuario completo la tarea
        ref: 'Usuario',
    }
}, {
    timestamps: true
})

const Tarea = mongoose.model('Tarea', tareaSchema)
export default Tarea
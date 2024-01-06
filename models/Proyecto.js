import mongoose from "mongoose";

const proyectosSchema = new mongoose.Schema({
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
    fechaEntrega: {
        type: Date,
        default: Date.now(),
    },
    cliente: {
        type: String,
        trim: true,
        required: true
    },
    creador: {
        type: mongoose.Schema.Types.ObjectId,   //referencia con usuarios para saber que usuario creó tal proyecto
        ref: 'Usuario',
    },
    tareas: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:'Tarea',
        }
    ],
    colaboradores: [    //corchetes: quiere decir que va a haber mas de un colaborador 
        {
            type: mongoose.Schema.Types.ObjectId,   //referencia con usuarios para saber que usuario creó tal proyecto
            ref: 'Usuario',
        }
    ],


}, {
    timestamps: true    //guarda la fecha de creado y actualizado un proyecto
})

const Proyecto = mongoose.model('Proyecto', proyectosSchema)
export default Proyecto
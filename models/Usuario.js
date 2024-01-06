import mongoose from "mongoose";
import bcrypt from 'bcrypt'


//estructura de la dba
const usuarioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true  //elimina espacios antes y despues de la palabra
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    token: {
        type: String,
    },
    confirmado: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true,  //crea una columna de creado y otra de actualizado
})

//se ejecuta antes de guardar el registro en la dba
usuarioSchema.pre('save', async function(next){
    
    //evitar volver a hashear la password siesque el usuario esta modificando algun apartado de sus datos
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)

})

usuarioSchema.methods.comprobarPassword = async function(passwordFormulario) {
    return await bcrypt.compare(passwordFormulario, this.password)
}

const Usuario = mongoose.model("Usuario", usuarioSchema)
export default Usuario
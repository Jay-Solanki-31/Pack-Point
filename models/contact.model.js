import mongoose, {Schema} from "mongoose";


const ContactSchema = new mongoose.Schema({
    username:{
        type:String,
    },
    email:{
        type:String
    },
    subject:{
        type:String
    },
    message:{
        type:String
    }
}, {timestamps:true});

export const Contact = mongoose.model('Contact', ContactSchema);


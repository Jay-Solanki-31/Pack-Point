import mongoose, {Schema} from "mongoose";


const ContactSchema = new mongoose.Schema({
    name:{
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
    },
    Phone:{
        type:Number
    }

}, {timestamps:true});

export const Contact = mongoose.model('Contact', ContactSchema);


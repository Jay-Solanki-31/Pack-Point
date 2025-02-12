import mongoose, {Schema} from "mongoose";

const produtSchema = new mongoose.Schema({
    title:{
        type:String,
        required: [true, 'Please provide a title'],
        lowercase: true,
        trim: true, 
        index: true
    },
    description:{
        type:String,
        required: [true, 'Please provide a description'],
        trim: true, 
        index: true
    },
    price:{
        type:Number,
        required: [true, 'Please provide a price']
    },
    imgUrls: { type: [String], required: true }, 

    
    sku:{
        type:String,
    },
    isAvailable:{
        type:Boolean,
        default:true,
    },
    rating:{
        type:Number,
        default: 5,
        min:1,
        max:5
    },
    

}, { timestamp: true });


export const Product = mongoose.model('Product', produtSchema);
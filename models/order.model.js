import mongoose, { Schema } from "mongoose";

const OrderSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        fullname:{
            type:String,
            require:true
        },
        lastname:{
            type:String,
            require:true,
        },
        address:{
            type:String,
            require:true
        },
        city:{
            type:String,
            require:true,
        },
        phone:{
            type:Number,
            require:true
        },
        email:{
            type:Number,
            require:true
        }


    },
    { timestamps: true }
);

export const Order = mongoose.model("Order", OrderSchema);

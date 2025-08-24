import mongoose, { Schema } from "mongoose";
import { BaseDocument } from "../../base/baseModel";
import { CartStatusEnum } from "../../constants/model.const";

export type ICart = BaseDocument&{
    userId:string;
    productId: string;
    quantity:number;
    status:string;
}

const CartSchema = new mongoose.Schema({
    userId:{type:Schema.Types.ObjectId,ref:"User"},
    productId:{type:Schema.Types.ObjectId,ref:"Product"},
    quantity:{type:Number},
    status:{type:String,default:CartStatusEnum.PENDING},
})

const CartModel = mongoose.model<ICart>("Cart", CartSchema);
export {CartModel};
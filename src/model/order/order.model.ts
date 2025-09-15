import mongoose, { Schema } from "mongoose";
import { BaseDocument } from "../../base/baseModel";
import { OrderStatusEnum } from "../../constants/model.const";

export type IOrder = BaseDocument & {
  code?:string;
  userId?: string;
  cartIds?: string[];
  price?: number;
  paymentMethod?: string;
  status?: string;
  totalPrice?: number;
  paid?: boolean;
  couponIds?: string[];
};

export const OrderSchema = new mongoose.Schema({
  code:{type:String},
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  cartIds: [{ type: String }],
  price: { type: Number },
  paymentMethod: { type: String },
  status: { type: String, enum: Object.values(OrderStatusEnum) },
  totalPrice: { type: Number, default: 0 },
  paid: { type: Boolean },
  couponIds: [{ type: Schema.Types.ObjectId, ref: "Coupon" }],
});

const OrderModel = mongoose.model<IOrder>("Order", OrderSchema);
export default OrderModel;

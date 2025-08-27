import mongoose, { Schema } from "mongoose";
import { BaseDocument } from "../../base/baseModel";
import { OrderStatusEnum } from "../../constants/model.const";

export type IOrder = BaseDocument & {
  userId?: string;
  cartIds?: string;
  price?: number;
  paymentMethod?: string;
  status?: string;
  totalPrice?: number;
  paid?: boolean;
};

export const OrderSchema = new mongoose.Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  cartIds: [{ type: String }],
  price: { type: Number },
  paymentMethod: { type: String },
  status: { type: String, enum: Object.values(OrderStatusEnum) },
  totalPrice: { type: Number, default: 0 },
  paid: { type: Boolean },
});

const OrderModel = mongoose.model<IOrder>("Order",OrderSchema);
export default OrderModel;
import mongoose from "mongoose";
import { BaseDocument } from "../../base/baseModel";

export type ICoupon = BaseDocument & {
  code?: string;
  title?: string;
  content?: string;
  image?: string;
  price?: number;
  priceCondition?: number;
};

const CouponSchema = new mongoose.Schema(
  {
    code: { type: String },
    title: { type: String },
    content: { type: String },
    image: { type: String },
    price: { type: Number },
    priceCondition: { type: Number },
  },
  { timestamps: true }
);

const CouponModel = mongoose.model<ICoupon>("Coupon", CouponSchema);
export { CouponModel };

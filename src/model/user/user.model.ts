import mongoose, { Schema, Types } from "mongoose";
import { BaseDocument } from "../../base/baseModel";
import { Type } from "typescript/lib/typescript";

//định nghĩa các type cho user
export type IUser = BaseDocument & {
  name?: string;
  phone?: string;
  email?: string;
  password?: string;
  walletId?: Types.ObjectId;
  usedCouponIds?: Types.ObjectId[];
  role?: string;
  key?: string;
};

const UserSchema = new mongoose.Schema(
  {
    name: { type: String },
    phone: { type: String },
    email: { type: String },
    password: { type: String },
    walletId: { type: Schema.Types.ObjectId, ref: "Wallet" },
    usedCouponIds: [
      { type: Schema.Types.ObjectId, ref: "Coupon", default: [] },
    ],
    role: { type: String },
    key: { type: String },
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model<IUser>("user", UserSchema);
export { UserModel };

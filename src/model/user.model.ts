import mongoose from "mongoose";
import { BaseDocument } from "../base/baseModel";

//định nghĩa các type cho user
export type IUser = BaseDocument & {
  name: string;
  phone: string;
  email: string;
  password: string;
  role: string;
  key?: string;
};

const UserSchema = new mongoose.Schema(
  {
    name: { type: String },
    phone: { type: String },
    email: { type: String },
    password: { type: String },
    role: { type: String },
    key: { type: String },
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model<IUser>("User", UserSchema);
export { UserModel };

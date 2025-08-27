import { BaseDocument } from "../../base/baseModel";
import mongoose, { Schema } from "mongoose";

export type IWallet = BaseDocument & {
  userId?: string;
  balance?: number;
  passCode?: number;
};

export const WalletSchema = new mongoose.Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  balance: { type: Number },
  passCode: { type: Number },
});

const WalletModel = mongoose.model<IWallet>("Wallet", WalletSchema);
export default WalletModel;

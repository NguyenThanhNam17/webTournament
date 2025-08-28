import mongoose from "mongoose";
import { BaseDocument } from "../../base/baseModel";

export type IProduct = BaseDocument & {
  name?: string;
  price?: number;
  image?: string;
  describe?: string;
  slug?: string;
};

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String },
    price: { type: Number, default: 0 },
    image: { type: String },
    describe: { type: String },
    slug: { type: String },
  },
  { timestamps: true }
);

const ProductModel = mongoose.model<IProduct>("Product", ProductSchema);
export { ProductModel };

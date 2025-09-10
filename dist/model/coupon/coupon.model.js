"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponModel = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
var CouponSchema = new mongoose_1.default.Schema({
    code: { type: String },
    title: { type: String },
    content: { type: String },
    image: { type: String },
    price: { type: Number },
    priceCondition: { type: Number },
}, { timestamps: true });
var CouponModel = mongoose_1.default.model("Coupon", CouponSchema);
exports.CouponModel = CouponModel;
//# sourceMappingURL=coupon.model.js.map
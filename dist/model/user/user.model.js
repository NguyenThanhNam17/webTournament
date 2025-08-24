"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
var UserSchema = new mongoose_1.default.Schema({
    name: { type: String },
    phone: { type: String },
    email: { type: String },
    password: { type: String },
    role: { type: String },
    key: { type: String },
}, {
    timestamps: true,
});
var UserModel = mongoose_1.default.model("user", UserSchema);
exports.UserModel = UserModel;
//# sourceMappingURL=user.model.js.map
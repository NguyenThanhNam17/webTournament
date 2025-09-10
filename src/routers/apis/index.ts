import express from "express";
import UserRoute from "./user.route";
import ProductRoute from "./product.route";
import CartRoute from "./cart.route";
import WalletRoute from "./wallet.route";
import OrderRoute from "./order.route";
import CouponRoute from "./coupon.route";

const router = express.Router();

router.use("/user", UserRoute);
router.use("/product", ProductRoute);
router.use("/cart", CartRoute);
router.use("/wallet", WalletRoute);
router.use("/order", OrderRoute);
router.use("/coupon", CouponRoute);

export default router;

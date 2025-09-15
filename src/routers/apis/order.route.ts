import { ErrorHelper } from "../../base/error";
import {
  BaseRoute,
  Request,
  Response,
  NextFunction,
} from "../../base/baseRouter";
import { ROLES } from "../../constants/role.const";
import { UserModel } from "../../model/user/user.model";
import { TokenHelper } from "../../helper/token.helper";
import { CartModel } from "../../model/cart/cart.model";
import { ProductModel } from "../../model/product/product.model";
import WalletModel from "../../model/wallet/wallet.model";
import OrderModel from "../../model/order/order.model";
import { CartStatusEnum, OrderStatusEnum } from "../../constants/model.const";
import { CouponModel } from "../../model/coupon/coupon.model";
import { sendMail } from "../../helper/mailer";
import { OrderHelper } from "../../model/order/order.helper";

class OrderRoute extends BaseRoute {
  constructor() {
    super();
  }
  customRouting() {
    this.router.post(
      "/createOrder",
      [this.authentication],
      this.route(this.createOrder)
    );
    this.router.get(
      "/listOrder",
      [this.authentication],
      this.route(this.listOrder)
    );
    this.router.get(
      "/getOneOrder/:id",
      [this.authentication],
      this.route(this.getOneOrder)
    );
    this.router.post(
      "/cancelOrder",
      [this.authentication],
      this.route(this.cancelOrder)
    );
    this.router.post(
      "/deleteOneOrder",
      [this.authentication],
      this.route(this.deleteOneOrder)
    );
    this.router.post(
      "/updateOrderStatusForAdmin",
      [this.authentication],
      this.route(this.updateOrderStatusForAdmin)
    );
  }

  async authentication(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.get("x-token")) {
        throw ErrorHelper.unauthorized();
      }
      const tokenData: any = TokenHelper.decodeToken(req.get("x-token"));
      if ([ROLES.ADMIN, ROLES.CLIENT].includes(tokenData.role_)) {
        const user: any = await UserModel.findById(tokenData._id);
        if (!user) {
          throw ErrorHelper.userNotExist();
        }
        req.tokenInfo = tokenData;
        next();
      } else {
        throw ErrorHelper.permissionDeny();
      }
    } catch {
      throw ErrorHelper.unauthorized();
    }
  }

  async createOrder(req: Request, res: Response) {
    let { cartIds = [], paymentMethod, couponIds = [] } = req.body;

    if (!cartIds || cartIds.length === 0 || !paymentMethod) {
      throw ErrorHelper.requestDataInvalid("request data");
    }

    const carts = await CartModel.find({ _id: { $in: cartIds } });
    if (!carts || carts.length === 0) {
      throw ErrorHelper.forbidden("Không tìm thấy giỏ hàng");
    }

    const productPrices = await Promise.all(
      carts.map(async (cart: any) => {
        const product = await ProductModel.findById(cart.productId);
        if (!product) throw ErrorHelper.forbidden("Sản phẩm không tồn tại");
        return cart.quantity * product.price;
      })
    );
    let totalPrice = productPrices.reduce((a, b) => a + b, 0);

    let user = await UserModel.findById(req.tokenInfo._id);
    if (!user) throw ErrorHelper.userNotExist();

    let discount = 0;
    let validCouponIds: any[] = [];

    if (couponIds.length > 0) {
      const coupons = await CouponModel.find({ _id: { $in: couponIds } });

      coupons.forEach((coupon) => {
        const alreadyUsed = user.usedCouponIds?.some(
          (id) => id.toString() === coupon._id.toString()
        );
        if (alreadyUsed) return;

        if (totalPrice >= (coupon.priceCondition || 0)) {
          discount += coupon.price || 0;
          validCouponIds.push(coupon._id);
        }
      });

      if (discount > totalPrice) discount = totalPrice;
      totalPrice -= discount;

      if (validCouponIds.length > 0) {
        await UserModel.updateOne(
          { _id: user._id },
          { $addToSet: { usedCouponIds: { $each: validCouponIds } } }
        );
      }
    }

    let newBalance: number | undefined;
    if (paymentMethod === "WALLET") {
      let wallet = await WalletModel.findById(user.walletId);
      if (!wallet || wallet.balance < totalPrice) {
        throw ErrorHelper.forbidden("Bạn không đủ số dư để thanh toán");
      }

      wallet.balance -= totalPrice;
      await wallet.save();
      newBalance = wallet.balance;
    }

    let code = await OrderHelper.generateOrderCode();

    let order = new OrderModel({
      code: code,
      userId: req.tokenInfo._id,
      cartIds: cartIds,
      paymentMethod: paymentMethod,
      status: OrderStatusEnum.PENDING,
      totalPrice: totalPrice,
      paid: paymentMethod === "WALLET",
      couponIds: validCouponIds,
    });
    await order.save();

    await CartModel.updateMany(
      { _id: { $in: cartIds } },
      { $set: { status: CartStatusEnum.SUCCESS } }
    );
    await sendMail(
      user.email,
      "Thông báo mới",
      `
    <h2>Thông báo đặt hàng mới</h2>
    <p>Có một đơn hàng mới đã được đặt. Vui lòng kiểm tra và xử lý ngay.</p>
    <p>Mã đơn hàng: ${order.code}</p>
  `
    );
    res.status(200).json({
      status: 200,
      code: "200",
      message: "success",
      data: { order, discount, newBalance },
    });
  }

  async listOrder(req: Request, res: Response) {
    let listOrder = await OrderModel.find({ userId: req.tokenInfo._id });
    if (listOrder.length == 0) {
      throw ErrorHelper.forbidden("không có order nào của người dùng nào");
    }
    res.status(200).json({
      status: 200,
      code: "200",
      message: "succes",
      data: { listOrder },
    });
  }

  async getOneOrder(req: Request, res: Response) {
    let { id } = req.params;
    if (!id) {
      throw ErrorHelper.requestDataInvalid("request data");
    }
    let order = await OrderModel.findById(id);
    if (!order) {
      throw ErrorHelper.forbidden("không tồn tại order này");
    }
    res.status(200).json({
      status: 200,
      code: "200",
      message: "succes",
      data: {
        order,
      },
    });
  }

  async cancelOrder(req: Request, res: Response) {
    let { id } = req.body;
    let order = await OrderModel.findById(id);
    if (!order) {
      throw ErrorHelper.forbidden("không tồn tại order này");
    }
    order.status = OrderStatusEnum.FAILED;
    order.save();
    res.status(200).json({
      status: 200,
      code: "200",
      message: "succes",
      data: {
        order,
      },
    });
  }

  async deleteOneOrder(req: Request, res: Response) {
    let { id } = req.body;
    let order = await OrderModel.findById(id);
    if (!order) {
      throw ErrorHelper.forbidden("không tồn tại order này");
    }

    await OrderModel.deleteOne({ _id: id });

    res.status(200).json({
      status: 200,
      code: "200",
      message: "succes",
      data: {
        order,
      },
    });
  }

  async updateOrderStatusForAdmin(req: Request, res: Response) {
    let { orderId, status } = req.body;
    if (!orderId || !status) {
      throw ErrorHelper.requestDataInvalid("request data");
    }

    let order = await OrderModel.findById(orderId);
    if (!order) {
      throw ErrorHelper.forbidden("Không tìm thấy order");
    }

    if (
      ![
        OrderStatusEnum.FAILED,
        OrderStatusEnum.PENDING,
        OrderStatusEnum.SUCCESS,
      ].includes(status)
    ) {
      throw ErrorHelper.forbidden("không đúng trạng thái của order");
    }
    order.status = status;
    order.save();
    res.status(200).json({
      status: 200,
      code: "200",
      message: "succes",
      data: {
        order,
      },
    });
  }
}

export default new OrderRoute().router;

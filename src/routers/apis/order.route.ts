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
    let { cartIds, paymentMethod } = req.body;
    if (cartIds.length == 0 || !paymentMethod) {
      throw ErrorHelper.requestDataInvalid("request data");
    }

    var carts = await CartModel.find({ _id: { $in: cartIds } });
    if (!carts) {
      throw ErrorHelper.forbidden("Not cart");
    }

    let totalPrice = 0;
    await Promise.all(
      carts.map(async (cart: any) => {
        const product = await ProductModel.findById(cart.productId);
        totalPrice += cart.quantity * product.price;
      })
    );

    let user = await UserModel.findById(req.tokenInfo._id);

    if (paymentMethod == "WALLET") {
      let wallet = await WalletModel.findById(user.walletId);
      if (wallet.balance < totalPrice) {
        throw ErrorHelper.forbidden("bạn không đủ số dư để thanh toán");
      }
      await WalletModel.updateOne(
        { _id: wallet.id },
        {
          $inc: {
            balance: -totalPrice,
          },
        }
      );
    }

    let order = new OrderModel({
      userId: req.tokenInfo._id,
      cartIds: cartIds,
      paymentMethod: paymentMethod,
      status: OrderStatusEnum.PENDING,
      totalPrice: totalPrice,
      paid: paymentMethod == "CASH" ? false : true,
    });
    await order.save();

    await CartModel.updateMany(
      { _id: { $in: cartIds } },
      {
        $set: { status: CartStatusEnum.SUCCES },
      }
    );
    res.status(200).json({
      status: 200,
      code: "200",
      message: "succes",
      data: {
        order,
      },
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

export default new OrderRoute().route;

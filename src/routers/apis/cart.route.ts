import { ErrorHelper } from "../../base/error";
import {
  BaseRoute,
  Request,
  Response,
  NextFunction,
} from "../../base/baseRouter";
import { UserModel } from "../../model/user/user.model";
import { TokenHelper } from "../../helper/token.helper";
import { ROLES } from "../../constants/role.const";
import { CartModel } from "../../model/cart/cart.model";
import { CartStatusEnum } from "../../constants/model.const";
import { ProductModel } from "../../model/product/product.model";

class CartRoute extends BaseRoute {
  constructor() {
    super();
  }

  customRouting() {
    this.router.get(
      "/getAllCart",
      [this.authentication],
      this.route(this.getAllCart)
    );
    this.router.get(
      "/getOneCart",
      [this.authentication],
      this.route(this.getOneCart)
    );
    this.router.get(
      "/findOne",
      [this.authentication],
      this.route(this.findOne)
    );
    this.router.post(
      "/addCartProductToCart",
      [this.authentication],
      this.route(this.addCartProductToCart)
    );
    this.router.post(
      "/deleteCart",
      [this.authentication],
      this.route(this.deleteCart)
    );
    this.router.post(
      "/updateCart",
      [this.authentication],
      this.route(this.updateCart)
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

  async getAllCart(req: Request, res: Response) {
    let carts = await CartModel.find({
      userId: req.tokenInfo._id,
      status: CartStatusEnum.PENDING,
    });
    if (!carts) {
      throw ErrorHelper.forbidden("Not cart");
    }
    res.status(200).json({
      status: 200,
      code: "200",
      message: "succes",
      data: {
        carts,
      },
    });
  }

  async getOneCart(req: Request, res: Response) {
    let { id } = req.body;
    if (req.tokenInfo.role_ != ROLES.ADMIN) {
      throw ErrorHelper.permissionDeny();
    }
    if (!id) {
      throw ErrorHelper.requestDataInvalid("request data");
    }
    let cart = await CartModel.findById(id);
    if (!cart) {
      throw ErrorHelper.forbidden("not cart");
    }
    res.status(200).json({
      status: 200,
      code: "200",
      message: "succes",
      data: {
        cart,
      },
    });
  }

  async findOne(req: Request, res: Response) {
    let { name } = req.body;
    if (!name) {
      throw ErrorHelper.requestDataInvalid("request data");
    }
    let cart = await CartModel.findById(name);
    if (!cart) {
      throw ErrorHelper.forbidden("not cart");
    }
    res.status(200).json({
      status: 200,
      code: "200",
      message: "succes",
      data: {
        cart,
      },
    });
  }

  async addCartProductToCart(req: Request, res: Response) {
    let { quantity, productId } = req.body;
    if (!quantity || !productId) {
      throw ErrorHelper.requestDataInvalid("request data");
    }

    let product = await ProductModel.findById(productId);
    if (!product) {
      throw ErrorHelper.forbidden("Không tìm thấy sản phẩm");
    }

    let cart = new CartModel({
      userId: req.tokenInfo._id,
      quantity: quantity,
      productId: productId,
      status: CartStatusEnum.PENDING,
    });
    await cart.save();
    res.status(200).json({
      status: 200,
      code: "200",
      message: "succes",
      data: {
        cart,
      },
    });
  }

  async deleteCart(req: Request, res: Response) {
    if (req.tokenInfo.role_ != ROLES.ADMIN) {
      throw ErrorHelper.permissionDeny();
    }
    let { id } = req.body;
    if (!id) {
      throw ErrorHelper.requestDataInvalid("request data");
    }
    let cart = await CartModel.findById(id);
    if (!cart) {
      throw ErrorHelper.forbidden("not cart");
    }
    await CartModel.deleteOne(id);
    res.status(200).json({
      status: 200,
      code: "200",
      message: "succes",
      data: { cart },
    });
  }

  async updateCart(req: Request, res: Response) {
    let { id, productId, quantity, status } = req.body;
    let cart = await CartModel.findById(id);
    if (!cart) {
      throw ErrorHelper.forbidden("not cart");
    }
    cart.productId = productId || cart.productId;
    cart.quantity = quantity || cart.quantity;
    cart.status = status || cart.status;
    await cart.save();
    res.status(200).json({
      status: 200,
      code: "200",
      message: "succes",
      data: { cart },
    });
  }
}

export default new CartRoute().router;

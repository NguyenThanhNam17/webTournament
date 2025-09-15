import {
  BaseRoute,
  Request,
  Response,
  NextFunction,
} from "../../base/baseRouter";
import { ErrorHelper } from "../../base/error";
import { TokenHelper } from "../../helper/token.helper";
import { ROLES } from "../../constants/role.const";
import { UserModel } from "../../model/user/user.model";
import { CouponModel } from "../../model/coupon/coupon.model";

class CouponRoute extends BaseRoute {
  constructor() {
    super();
  }

  customRouting() {
    this.router.get(
      "/getAllCoupon",
      [this.authentication],
      this.route(this.getAllCoupon)
    );
    this.router.post(
      "/createCoupon",
      [this.authentication],
      this.route(this.createCoupon)
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

  async getAllCoupon(req: Request, res: Response) {
    const user = await UserModel.findById(req.tokenInfo._id);
    let usedCouponIds = user?.usedCouponIds || [];

    const coupons = await CouponModel.find({
      _id: { $nin: usedCouponIds },
    });

    res.status(200).json({
      status: 200, 
      code: "200",
      message: "succes",
      data: { coupons },
    });
  }

  async createCoupon(req: Request, res: Response) {
    let { code, title, content, image, price, priceCondition } = req.body;
    if (!code || !title || !content || !image || !price || !priceCondition) {
      throw ErrorHelper.requestDataInvalid("request data");
    }
    
    let checkCode = await CouponModel.findOne({code:code});
    if(checkCode){
      throw ErrorHelper.forbidden("đã tồn tại code giảm giá này")
    }

    let coupon = new CouponModel({
      code: code,
      title: title,
      content: content,
      image: image,
      price: price,
      priceCondition: priceCondition,
    });

    await coupon.save();
     res.status(200).json({
      status: 200,
      code: "200",
      message: "succes",
      data: {
        coupon,
      },
    });
  }
}

export default new CouponRoute().router;

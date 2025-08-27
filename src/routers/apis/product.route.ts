import { ProductModel } from "../../model/product/product.model";
import { ErrorHelper } from "../../base/error";
import {
  BaseRoute,
  Request,
  Response,
  NextFunction,
} from "../../base/baseRouter";
import { TokenHelper } from "../..//helper/token.helper";
import { UserModel } from "../../model/user/user.model";
import { ROLES } from "../../constants/role.const";

class ProductRoute extends BaseRoute {
  constructor() {
    super();
  }

  customRouting() {
    this.router.get("/getAllProduct", this.route(this.getAllProduct));
    this.router.get("/getOneProduct", this.route(this.getOneProduct));
    this.router.get(
      "/findOne",
      [this.authentication],
      this.route(this.findOne)
    );
    this.router.post(
      "/createProduct",
      [this.authentication],
      this.route(this.createProduct)
    );
    this.router.post(
      "/deleteProduct",
      [this.authentication],
      this.route(this.deleteProduct)
    );
    this.router.post(
      "/updateProduct",
      [this.authentication],
      this.route(this.updateProduct)
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

  async getAllProduct(req: Request, res: Response) {
    let product = await ProductModel.find();
    if (!product) {
      throw ErrorHelper.forbidden("Không có sẵn phẩm trong danh sách");
    }
    res.status(200).json({
      status: 200,
      code: "200",
      message: "succes",
      data: {
        product,
      },
    });
  }

  async getOneProduct(req: Request, res: Response) {
    let { id } = req.body;
    if (!id) {
      throw ErrorHelper.requestDataInvalid("request data");
    }
    let product = await ProductModel.findById(id);
    if (!product) {
      throw ErrorHelper.forbidden("sản phẩm không tồn tại");
    }
    res.status(200).json({
      status: 200,
      code: "200",
      message: "succes",
      data: {
        product,
      },
    });
  }

  async findOne(req: Request, res: Response) {
    let { name } = req.body;
    if (!name) {
      throw ErrorHelper.requestDataInvalid("request data");
    }

    let product = await ProductModel.findOne({ name: name });
    if (!product) {
      throw ErrorHelper.forbidden("Không có sản phẩm");
    }
    res.status(200).json({
      status: 200,
      code: "200",
      message: "succes",
      data: {
        product,
      },
    });
  }

  async createProduct(req: Request, res: Response) {
    let { name, image, describe, price } = req.body;
    if (!name || !image || !describe || !price) {
      throw ErrorHelper.requestDataInvalid("request data");
    }

    let product = new ProductModel({
      name: name,
      image: image,
      describe: describe,
      price: price,
    });

    await product.save();
    res.status(200).json({
      status: 200,
      code: "200",
      message: "succes",
      data: {
        product,
      },
    });
  }

  async deleteProduct(req: Request, res: Response) {
    let { id } = req.body;
    if (!id) {
      throw ErrorHelper.requestDataInvalid("request data");
    }
    let product = await ProductModel.findById(id);
    if(!product){
      throw ErrorHelper.forbidden("không có sản phẩm để xoá");
    }
    await ProductModel.deleteOne({_id:id});
    res.status(200).json({
      status: 200,
      code: "200",
      message: "succes",
      data: {
        product,
      },
    });
  }

  async updateProduct(req: Request, res: Response) {
    let { id, name, describe, price, image } = req.body;
    if (!id) {
      throw ErrorHelper.requestDataInvalid("request data");
    }
    let product = await ProductModel.findById(id);
    if (!product) {
      throw ErrorHelper.forbidden("Không tìm thấy sản phẩm");
    }
    product.name = name || product.name;
    product.price = price || product.price;
    product.image = image || product.image;
    product.describe = describe || product.describe;

    product.save();
    res.status(200).json({
      status: 200,
      code: "200",
      message: "succes",
      data: {
        product,
      },
    });
  }
}

export default new ProductRoute().router;
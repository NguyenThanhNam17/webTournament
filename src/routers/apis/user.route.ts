import { ErrorHelper } from "../../base/error";
import {
  BaseRoute,
  Request,
  Response,
  NextFunction,
} from "../../base/baseRouter";
import { UserModel } from "../../model/user.model";
import { TokenHelper } from "../../helper/token.helper";
import passwordHash from "password-hash";
import { ROLES } from "../../constants/role.const";

class UserRoute extends BaseRoute {
  constructor() {
    super();
  }

  customRouting() {
    this.router.post("/register", this.route(this.register));
  }

  async register(req: Request, res: Response) {
    let { username, phone, email, password } = req.body;
    if (!username || !phone || !email || !password) {
      throw ErrorHelper.requestDataInvalid("data invalid");
    }

    let user = await UserModel.findOne({ phone: phone });
    if (user) {
      throw ErrorHelper.userExisted();
    }

    const key = TokenHelper.generateKey();

    user = new UserModel({
      name: username,
      phone: phone,
      email: email,
      password: passwordHash.generate(password),
      role: ROLES.CLIENT,
      key: key,
    });

    await user.save();
    res.status(200).json({
      status: 200,
      code: "200",
      message: "succes",
      data: {
        user,
      },
    });
  }
}

export default UserRoute;

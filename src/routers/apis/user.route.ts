import { ErrorHelper } from "../../base/error";
import {
  BaseRoute,
  Request,
  Response,
  NextFunction,
} from "../../base/baseRouter";
import { UserModel } from "../../model/user/user.model";
import { TokenHelper } from "../../helper/token.helper";
import passwordHash from "password-hash";
import { ROLES } from "../../constants/role.const";
import { UserHelper } from "../../model/user/user.helper";

class UserRoute extends BaseRoute {
  constructor() {
    super();
  }

  customRouting() {
    this.router.post("/register", this.route(this.register));
    this.router.post("/login", this.route(this.login));
    this.router.get("/getAllUser", this.route(this.getAllUser));
    this.router.get("/getMe", [this.authentication], this.route(this.getMe));
    this.router.get("/getOneUser", this.route(this.getOneUser));
    this.router.get(
      "/findOne",
      [this.authentication],
      this.route(this.findOne)
    );
    this.router.post(
      "/createUser",
      [this.authentication],
      this.route(this.createUser)
    );
    this.router.post(
      "/deleteUser",
      [this.authentication],
      this.route(this.deleteUser)
    );
    this.router.post(
      "/updateUser",
      [this.authentication],
      this.route(this.updateUser)
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

  async getMe(req: Request, res: Response) {
    const user: any = await UserModel.findById(req.tokenInfo._id);
    if (!user) {
      throw ErrorHelper.userNotExist();
    }
    res.status(200).json({
      status: 200,
      code: "200",
      message: "succes",
      data: { user },
    });
  }

  async login(req: Request, res: Response) {
    let { username, password } = req.body;
    if (!username || !password) {
      throw ErrorHelper.requestDataInvalid("request data");
    }

    let user = await UserModel.findOne({
      $or: [{ phone: username }, { username: username }],
    });
    if (!user) {
      throw ErrorHelper.userNotExist();
    }

    let check = passwordHash.verify(password, user.password);
    if (!check) {
      throw ErrorHelper.userPasswordNotCorrect();
    }

    const key = TokenHelper.generateKey();
    return res.status(200).json({
      status: 200,
      code: "200",
      message: "succes",
      data: {
        user,
        token: new UserHelper(user).getToken(key),
      },
    });
  }

  async getAllUser(req: Request, res: Response) {
    let users = await UserModel.find();
    if (!users) {
      throw ErrorHelper.userNotExist();
    }
    return res.status(200).json({
      status: 200,
      code: "200",
      message: "succes",
      data: {
        users,
      },
    });
  }

  async getOneUser(req: Request, res: Response) {
    let { id } = req.body;
    if (!id) {
      throw ErrorHelper.requestDataInvalid("request data");
    }
    let user = await UserModel.findById({ _id: id });
    if (!user) {
      throw ErrorHelper.userNotExist();
    }
    return res.status(200).json({
      status: 200,
      code: "200",
      message: "succes",
      data: {
        user,
      },
    });
  }

  async findOne(req: Request, res: Response) {
    let { name } = req.body;
    if (!name) {
      throw ErrorHelper.requestDataInvalid("request data");
    }
    let user = await UserModel.findOne({ name: name });
    if (!user) {
      throw ErrorHelper.userNotExist();
    }
    return res.status(200).json({
      status: 200,
      code: "200",
      message: "succes",
      data: {
        user,
      },
    });
  }

  async createUser(req: Request, res: Response) {
    if (ROLES.ADMIN != req.tokenInfo.role_) {
      throw ErrorHelper.permissionDeny();
    }

    let { name, phone, email, password } = req.body;
    if (!name || !phone || !email || !password) {
      throw ErrorHelper.requestDataInvalid("request data");
    }

    const key = TokenHelper.generateKey();

    let user: any = new UserModel({
      name: name,
      phone: phone,
      email: email,
      password: passwordHash.generate(password),
      key: key,
      role: ROLES.CLIENT,
    });

    await user.save();
    return res.status(200).json({
      status: 200,
      code: "200",
      message: "succes",
      data: {
        user,
      },
    });
  }

  async deleteUser(req: Request, res: Response) {
    if (ROLES.ADMIN != req.tokenInfo.role_) {
      throw ErrorHelper.permissionDeny();
    }

    let { id } = req.body;

    let user = await UserModel.findById(id);
    if (!user) {
      throw ErrorHelper.userNotExist();
    }

    await UserModel.deleteOne({ _id: id });
    return res.status(200).json({
      status: 200,
      code: "200",
      message: "succes",
      data: {
        user,
      },
    });
  }

  async updateUser(req: Request, res: Response) {
    let { id, name, phone, password, email } = req.body;
    let user = await UserModel.findById(id);
    if (!user) {
      throw ErrorHelper.userNotExist();
    }
    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.email = email || user.email;
    user.password = password || user.password;

    await user.save();
    return res.status(200).json({
      status: 200,
      code: "200",
      message: "succes",
      data: {
        user,
      },
    });
  }
}

export default new UserRoute().router;

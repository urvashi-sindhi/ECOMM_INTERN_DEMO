import { JwtService } from '@nestjs/jwt';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { InjectModel } from '@nestjs/sequelize';
import { UserModel } from 'src/models/user.model';
import { GeneralResponse } from 'src/libs/services/generalResponse';
import { ResponseData } from 'src/libs/utility/constants/response';
import { Messages } from 'src/libs/utility/constants/message';
import * as bcrypt from 'bcrypt';
import { AddressModel } from 'src/models/address.model';
import * as path from 'path';
import * as fs from 'fs';
import { emailSend, sendOtp } from 'src/libs/helpers/mail';
import { OtpModel } from 'src/models/otp.model';
import { CityModel } from 'src/models/city.model';
import { StateModel } from 'src/models/state.model';
import { CountryModel } from 'src/models/country.model';
import { Op } from 'sequelize';
import { pagination, sorting } from 'src/libs/services/commonFunction';
import { UserUpdateDto } from './dto/userUpdate.dto';

@Injectable()
export class UserService {
  [x: string]: any;
  constructor(
    @InjectModel(UserModel) private readonly userModel: typeof UserModel,
    @InjectModel(AddressModel)
    private readonly addressModel: typeof AddressModel,
    @InjectModel(OtpModel)
    private readonly otpModel: typeof OtpModel,
    @InjectModel(CityModel) private readonly cityModel: typeof CityModel,
    @InjectModel(StateModel) private readonly stateModel: typeof StateModel,
    @InjectModel(CountryModel)
    private readonly countryModel: typeof CountryModel,

    private readonly jwtService: JwtService,
  ) {}

  async fileUpload(files: Express.Multer.File[]) {
    try {
      if (!files || files.length === 0) {
        return GeneralResponse(
          HttpStatus.BAD_REQUEST,
          ResponseData.ERROR,
          Messages.MAX_FILE,
        );
      }

      const uploadDir = path.join(__dirname, '..', '..', 'public', 'uploads');

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const result: string[] = [];

      for (const file of files) {
        const fileUrl = file.filename;
        result.push(fileUrl);
      }

      Logger.log(`Image ${Messages.UPDATE_SUCCESS}`);
      return GeneralResponse(
        HttpStatus.CREATED,
        ResponseData.SUCCESS,
        `Image ${Messages.UPDATE_SUCCESS}`,
        result,
      );
    } catch (error) {
      Logger.error(error.message || error);
      return GeneralResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseData.ERROR,
        error.message || error,
      );
    }
  }

  async userRegister(createUserDto: CreateUserDto) {
    const { name, email, phone_number, gender, profile_image, address } =
      createUserDto;

    const existingUser = await UserModel.findOne({
      where: { email },
    });

    if (existingUser) {
      Logger.log(`User ${Messages.ALREADY_EXIST}`);
      return GeneralResponse(
        HttpStatus.NOT_FOUND,
        ResponseData.ERROR,
        `User ${Messages.ALREADY_EXIST}`,
      );
    }

    await this.checkAddress(
      address.city_id,
      address.state_id,
      address.country_id,
    );

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const userPayload: any = {
      name,
      email,
      password: hashedPassword,
      phone_number,
      gender,
      profile_image,
    };

    const userDetails = await this.userModel.create(userPayload);

    await this.addressModel.create({
      user_id: userDetails.dataValues.id,
      name,
      phone_number,
      home_address: true,
      ...address,
    } as any);

    const id = userDetails.dataValues.id;

    Logger.log(`User ${Messages.ADD_SUCCESS}`);
    return GeneralResponse(
      HttpStatus.OK,
      ResponseData.SUCCESS,
      `${Messages.REGISTRATION_SUCCESS}`,
      { id },
    );
  }

  async userProfile(req: any) {
    const id = req.user.id;

    const userData = await this.userModel.findOne({
      where: { id, is_deleted: false },
      attributes: [
        'id',
        'name',
        'email',
        'phone_number',
        'gender',
        'profile_image',
        'role',
      ],
      include: [
        {
          model: AddressModel,
          attributes: [
            'id',
            'country_id',
            'state_id',
            'city_id',
            'postal_code',
            'label',
            'home_address',
            'address_line1',
            'address_line2',
          ],
          where: { home_address: 1 },
        },
      ],
    });

    if (!userData) {
      Logger.error(`User ${Messages.NOT_FOUND}`);
      return GeneralResponse(
        HttpStatus.NOT_FOUND,
        ResponseData.ERROR,
        `User ${id} ${Messages.NOT_FOUND}`,
      );
    }

    let userObj = userData.toJSON();
    let responseObj: any;
    if (
      userObj.address &&
      Array.isArray(userObj.address) &&
      userObj.address.length > 0
    ) {
      responseObj = { ...userObj, address: userObj.address[0] };
    }

    Logger.log(`User ${Messages.RETRIEVED_SUCCESS}`);
    return GeneralResponse(
      HttpStatus.OK,
      ResponseData.SUCCESS,
      `User ${Messages.RETRIEVED_SUCCESS}`,
      responseObj,
    );
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const userExists = await this.userModel.findOne({ where: { email } });

    if (!userExists) {
      Logger.error(Messages.USER_NOT_FOUND);
      return GeneralResponse(
        HttpStatus.BAD_REQUEST,
        ResponseData.ERROR,
        Messages.USER_NOT_FOUND,
      );
    }

    const isPasswordMatch = await bcrypt.compare(
      password,
      userExists.dataValues.password,
    );

    if (!isPasswordMatch) {
      Logger.error(`${Messages.CREDENTIAL_NOT_MATCH}`);
      return GeneralResponse(
        HttpStatus.BAD_REQUEST,
        ResponseData.ERROR,
        `${Messages.CREDENTIAL_NOT_MATCH}`,
      );
    }

    const token = await this.jwtService.signAsync({
      id: userExists.dataValues.id,
      email: userExists.dataValues.email,
      role: userExists.dataValues.role,
    });

    Logger.log(`${Messages.LOGIN_SUCCESS}`);
    return GeneralResponse(
      HttpStatus.OK,
      ResponseData.SUCCESS,
      Messages.LOGIN_SUCCESS,
      { token },
    );
  }

  async userUpdate(dto: UserUpdateDto, req: any) {
    try {
      const { address, ...userDetails } = dto;
      const id = req.user.id;

      const findUser = await this.userModel.findOne({
        where: { id, is_deleted: false },
      });

      if (!findUser) {
        Logger.error(`User ${Messages.NOT_FOUND}`);
        return GeneralResponse(
          HttpStatus.NOT_FOUND,
          ResponseData.ERROR,
          `User ${Messages.NOT_FOUND}`,
        );
      }

      await this.userModel.update(
        { ...userDetails },
        { where: { id: findUser.dataValues.id } },
      );

      await this.addressModel.update(
        { name: userDetails.name, phone_number: userDetails.phone_number },
        { where: { user_id: id, home_address: 1 } },
      );

      if (address) {
        await this.checkAddress(
          address?.city_id,
          address?.state_id,
          address?.country_id,
        );

        await this.addressModel.update(
          { ...address },
          { where: { user_id: id } },
        );
      }

      Logger.log(`Profile ${Messages.UPDATE_SUCCESS}`);
      return GeneralResponse(
        HttpStatus.OK,
        ResponseData.SUCCESS,
        `Profile ${Messages.UPDATE_SUCCESS}`,
      );
    } catch (error) {
      Logger.error(`${Messages.FAIL}`);
      return GeneralResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseData.ERROR,
        Messages.FAIL,
      );
    }
  }

  async userDelete(id: number) {
    const userData = await this.userModel.findOne({
      where: { id },
    });

    if (!userData) {
      Logger.error(`User ${Messages.NOT_FOUND}`);
      return GeneralResponse(
        HttpStatus.NOT_FOUND,
        ResponseData.ERROR,
        `User ${Messages.NOT_FOUND}`,
      );
    }

    const is_deleted = userData.dataValues.is_deleted === true ? false : true;

    await this.userModel.update({ is_deleted }, { where: { id } });

    Logger.log(`User ${Messages.DELETE_SUCCESS}`);
    return GeneralResponse(
      HttpStatus.OK,
      ResponseData.SUCCESS,
      `User ${Messages.DELETE_SUCCESS}`,
    );
  }

  async verifyEmail(dto: any) {
    const { email } = dto;
    const userData = await this.userModel.findOne({ where: { email } });

    if (!userData) {
      Logger.error(Messages.USER_NOT_FOUND);
      return GeneralResponse(
        HttpStatus.NOT_FOUND,
        ResponseData.ERROR,
        Messages.USER_NOT_FOUND,
      );
    }

    const otp = sendOtp();
    const sendMail = { email, otp };
    const otpdata: any = {
      email: email,
      otp: otp,
      expiry_time: new Date(Date.now() + 5 * 60 * 1000)
        .toISOString()
        .slice(0, 19)
        .replace('T', ' '),
    };

    await this.otpModel.create(otpdata);

    await emailSend(sendMail);

    Logger.log(`OTP ${Messages.SEND_SUCCESS}`);
    return GeneralResponse(
      HttpStatus.OK,
      ResponseData.SUCCESS,
      `OTP ${Messages.SEND_SUCCESS}`,
    );
  }

  async countryList() {
    const country = await this.countryModel.findAll({
      attributes: ['id', 'country_name'],
    });

    Logger.log(`Countries ${Messages.RETRIEVED_SUCCESS}`);
    return GeneralResponse(
      HttpStatus.OK,
      ResponseData.SUCCESS,
      undefined,
      country || [],
    );
  }

  async stateList(country_id: number) {
    const state = await this.stateModel.findAll({
      where: { country_id },
      attributes: ['id', 'state_name'],
    });
    if (state.length === 0) {
      return GeneralResponse(
        HttpStatus.BAD_REQUEST,
        ResponseData.ERROR,
        `Country ${Messages.NOT_EXIST}`,
      );
    }
    Logger.log(`States ${Messages.RETRIEVED_SUCCESS}`);
    return GeneralResponse(
      HttpStatus.OK,
      ResponseData.SUCCESS,
      undefined,
      state || [],
    );
  }

  async cityList(state_id: number) {
    const city = await this.cityModel.findAll({
      where: { state_id },
      attributes: ['id', 'city_name'],
    });

    if (city.length === 0) {
      Logger.error(`Cities ${Messages.NOT_FOUND}`);
      return GeneralResponse(
        HttpStatus.NOT_FOUND,
        ResponseData.ERROR,
        `Cities ${Messages.NOT_FOUND}`,
      );
    }

    Logger.log(`Cities ${Messages.RETRIEVED_SUCCESS}`);
    return GeneralResponse(
      HttpStatus.OK,
      ResponseData.SUCCESS,
      undefined,
      city,
    );
  }

  async changePassword(dto: any) {
    const { email, currentPassword, newPassword } = dto;
    const userData = await this.userModel.findOne({
      where: { email, is_deleted: false },
    });

    if (!userData) {
      Logger.error(`User ${Messages.NOT_FOUND}`);
      return GeneralResponse(
        HttpStatus.NOT_FOUND,
        ResponseData.ERROR,
        `User ${Messages.NOT_FOUND}`,
      );
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      userData.dataValues.password,
    );

    if (!isMatch) {
      Logger.error(`Current ${Messages.PASS_INCORRECT}`);
      return GeneralResponse(
        HttpStatus.BAD_REQUEST,
        ResponseData.ERROR,
        `Current ${Messages.PASS_INCORRECT}`,
      );
    }

    const id = userData.dataValues.id;
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.userModel.update(
      { password: hashedPassword },
      {
        where: { id },
      },
    );

    Logger.log(`Your password ${Messages.UPDATE_SUCCESS}`);
    return GeneralResponse(
      HttpStatus.ACCEPTED,
      ResponseData.SUCCESS,
      `Your password ${Messages.UPDATE_SUCCESS}`,
    );
  }

  async forgotPassword(dto: any) {
    const { email, otp, newPassword } = dto;
    const userData = await this.userModel.findOne({ where: { email } });

    if (!userData) {
      Logger.error(Messages.USER_NOT_FOUND);
      return GeneralResponse(
        HttpStatus.NOT_FOUND,
        ResponseData.ERROR,
        Messages.USER_NOT_FOUND,
      );
    }

    const findOtp = await this.otpModel.findOne({ where: { otp } });

    if (!findOtp) {
      Logger.error(Messages.OTP_NOT_MATCH);
      return GeneralResponse(
        HttpStatus.NOT_FOUND,
        ResponseData.ERROR,
        Messages.OTP_NOT_MATCH,
      );
    }

    const currentTime = new Date().toISOString();
    const expiredTime = new Date(findOtp.dataValues.expiry_time).toISOString();

    if (expiredTime < currentTime) {
      await this.otpModel.destroy({ where: { otp } });
      Logger.error(Messages.OTP_EXPIRED);
      return GeneralResponse(
        HttpStatus.BAD_REQUEST,
        ResponseData.ERROR,
        Messages.OTP_EXPIRED,
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userModel.update(
      { password: hashedPassword },
      { where: { email } },
    );

    return GeneralResponse(
      HttpStatus.OK,
      ResponseData.SUCCESS,
      `Password ${Messages.UPDATE_SUCCESS}`,
    );
  }

  async listOfUsers(dto: any) {
    const { search, pageSize, page, sortValue, sortKey } = dto;
    const sortQuery = sorting(sortKey, sortValue);

    const whereCondition: any = {
      attributes: [
        'id',
        'name',
        'email',
        'phone_number',
        'gender',
        'role',
        'is_deleted',
        'createdAt',
        'updatedAt',
      ],
      order: sortQuery,
      where: {},
    };

    if (search) {
      whereCondition.where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone_number: { [Op.like]: `%${search}%` } },
      ];
    }

    const paginationResult = await pagination(
      this.userModel,
      page,
      pageSize,
      whereCondition,
      'users',
    );

    Logger.log(`Users ${Messages.RETRIEVED_SUCCESS}`);
    return GeneralResponse(
      HttpStatus.OK,
      ResponseData.SUCCESS,
      `Users ${Messages.RETRIEVED_SUCCESS}`,
      paginationResult,
    );
  }

  async checkAddress(city_id: number, state_id: number, country_id: number) {
    if (city_id) {
      const findCity = await this.cityModel.findOne({
        where: { id: city_id },
      });

      if (!findCity) {
        Logger.error(`City ${Messages.NOT_FOUND}`);
        return GeneralResponse(
          HttpStatus.NOT_FOUND,
          ResponseData.ERROR,
          `City ${Messages.NOT_FOUND}`,
        );
      }
    }

    if (state_id) {
      const findState = await this.stateModel.findOne({
        where: { id: state_id },
      });

      if (!findState) {
        Logger.error(`State ${Messages.NOT_FOUND}`);
        return GeneralResponse(
          HttpStatus.NOT_FOUND,
          ResponseData.ERROR,
          `State ${Messages.NOT_FOUND}`,
        );
      }
    }

    if (country_id) {
      const findCountry = await this.countryModel.findOne({
        where: { id: country_id },
      });

      if (!findCountry) {
        Logger.error(`Country ${Messages.NOT_FOUND}`);
        return GeneralResponse(
          HttpStatus.NOT_FOUND,
          ResponseData.ERROR,
          `Country ${Messages.NOT_FOUND}`,
        );
      }
    }
  }
}

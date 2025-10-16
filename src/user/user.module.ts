import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserModel } from 'src/models/user.model';
import { AppLogger } from 'src/libs/helpers/logger';
import { AddressModel } from 'src/models/address.model';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import { OtpModel } from 'src/models/otp.model';
import { CityModel } from 'src/models/city.model';
import { StateModel } from 'src/models/state.model';
import { CountryModel } from 'src/models/country.model';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from 'src/libs/services/auth/jwt.strategy';
dotenv.config();

@Module({
  imports: [
    SequelizeModule.forFeature([
      UserModel,
      AddressModel,
      OtpModel,
      CityModel,
      StateModel,
      CountryModel,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '12h' },
    }),
  ],
  controllers: [UserController],
  providers: [UserService, AppLogger, JwtStrategy],
  exports: [UserService, JwtModule, PassportModule],
})
export class UserModule {}

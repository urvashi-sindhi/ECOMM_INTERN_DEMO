import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  UploadedFiles,
  Put,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import {
  ApiTags,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/libs/helpers/multer';
import { LoginDto } from './dto/login.dto';
import { UserUpdateDto } from './dto/userUpdate.dto';
import { VerifyEmailDto } from './dto/verifyEmail.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { UserRoles } from 'src/libs/utility/constants/enums';
import { JwtGuard } from 'src/libs/services/auth/jwt.guard';
import { RolesGuard } from 'src/libs/services/auth/roles.guard';
import { Roles } from 'src/libs/helpers/decorators/roles.decorators';

import { ListOfUserDto } from './dto/listOfUser.dto';

@ApiTags('User')
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @HttpCode(HttpStatus.OK)
  @Post('user/registration')
  userRegister(@Body() createUserDto: CreateUserDto) {
    return this.userService.userRegister(createUserDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('fileUpload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files', 5, multerOptions))
  fileUpload(@UploadedFiles() files: any) {
    return this.userService.fileUpload(files);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async userLogin(@Body() loginDto: LoginDto) {
    return await this.userService.login(loginDto);
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Get('viewProfile')
  findOne(@Req() req: any) {
    return this.userService.userProfile(req);
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Put('updateProfile')
  update(@Body() userUpdateDto: UserUpdateDto, @Req() req: any) {
    return this.userService.userUpdate(userUpdateDto, req);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRoles.CUSTOMER)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Delete('user/deleteProfile/:id')
  @ApiParam({ example: 1, name: 'id', required: true })
  delete(@Param('id') id: number) {
    return this.userService.userDelete(id);
  }

  @HttpCode(HttpStatus.OK)
  @Post('user/verifyEmail')
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return await this.userService.verifyEmail(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Put('user/changePassword')
  async changePassword(@Body() dto: ChangePasswordDto) {
    return await this.userService.changePassword(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Put('updatePassword')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return await this.userService.forgotPassword(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Get('listOfCountry')
  listCountry() {
    return this.userService.countryList();
  }

  @HttpCode(HttpStatus.OK)
  @Get('listOfState/:country_id')
  @ApiParam({ name: 'country_id', description: 'Country ID', type: Number })
  listState(@Param('country_id') country_id: number) {
    return this.userService.stateList(country_id);
  }

  @HttpCode(HttpStatus.OK)
  @Get('listOfCity/:state_id')
  @ApiParam({ name: 'state_id', description: 'State ID', type: Number })
  listCity(@Param('state_id') state_id: number) {
    return this.userService.cityList(state_id);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Post('listOfUser')
  async userList(@Body() dto: ListOfUserDto) {
    return await this.userService.listOfUsers(dto);
  }
}

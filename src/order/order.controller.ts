import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/libs/services/auth/jwt.guard';
import { OrderDto } from './dto/order.dto';
import { ListOfOrderDto } from './dto/listOfOrder.dto';
import { RolesGuard } from 'src/libs/services/auth/roles.guard';
import { UserRoles } from 'src/libs/utility/constants/enums';
import { Roles } from 'src/libs/helpers/decorators/roles.decorators';
import { AddAddressDto } from './dto/add-address.dto';
import { UpdateAddressDto } from './dto/updateAddress.dto';

@ApiTags('order')
@Controller()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Post('order/create-order')
  async createOrder(@Body() dto: OrderDto, @Req() req: any) {
    return this.orderService.createOrder(dto, req);
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Post('order/listOfUserOrder')
  async ListOfOrderUser(@Body() dto: ListOfOrderDto, @Req() req: any) {
    return this.orderService.ListOfOrderUser(dto, req);
  }

  @Roles(UserRoles.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Post('order/listOfOrder')
  async ListOfOrders(@Body() dto: ListOfOrderDto) {
    return this.orderService.ListOfOrders(dto);
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Get('order/viewOrder/:id')
  @ApiParam({ name: 'id', description: 'order_id', type: Number })
  async viewOrder(@Param('id') order_id: number, @Req() req: any) {
    return this.orderService.viewOrder(order_id, req);
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Put('order/cancelOrder/:id')
  @ApiParam({ name: 'id', description: 'order_id', type: Number })
  async cancelOrder(@Param('id') order_id: number, @Req() req: any) {
    return this.orderService.cancelOrder(order_id, req);
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Post('order/addAddress')
  async addAddress(@Body() dto: AddAddressDto, @Req() req: any) {
    return this.orderService.addAddress(req, dto);
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Get('order/listOfAddress')
  async listOfAddress(@Req() req: any) {
    return this.orderService.listOfAddress(req);
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Get('order/viewAddress/:id')
  @ApiParam({ name: 'id', description: 'address_id', type: Number })
  async viewAddress(@Req() req: any, @Param('id') address_id: number) {
    return this.orderService.viewAddress(req, address_id);
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Put('order/updateAddress/:id')
  @ApiParam({ name: 'id', description: 'address_id', type: Number })
  async updateOrderAddress(
    @Param('id') address_id: number,
    @Body() dto: UpdateAddressDto,
    @Req() req: any,
  ) {
    return this.orderService.updateAddress(address_id, dto, req);
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', description: 'address_id', type: Number })
  @Delete('order/deleteAddress/:id')
  async deleteAddress(@Param('id') address_id: number, @Req() req: any) {
    return this.orderService.deleteAddress(address_id, req);
  }
}

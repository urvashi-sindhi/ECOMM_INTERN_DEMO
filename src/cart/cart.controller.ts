import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/libs/services/auth/jwt.guard';
import { CreateCartDto } from './dto/cart.dto';

@ApiTags('cart')
@Controller()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Post('cart/addToCart')
  addToCart(@Body() dto: CreateCartDto, @Req() req: any) {
    return this.cartService.addToCart(dto, req);
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Get('cart/viewCart')
  viewCart(@Req() req: any) {
    return this.cartService.viewCart(req);
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', description: 'Cart ID', type: Number })
  @Delete('cart/deleteCart/:id')
  deleteCart(@Param('id') id: number) {
    return this.cartService.deleteCart(id);
  }
}

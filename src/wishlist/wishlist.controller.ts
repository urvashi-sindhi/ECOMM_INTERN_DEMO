import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { WishlistDto } from './dto/wishlist.dto';
import { ListOfWishlistDto } from './dto/listOfWishlist.dto';
import { JwtGuard } from 'src/libs/services/auth/jwt.guard';

@ApiTags('wishlist')
@Controller()
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Post('wishlist/addToWishlist')
  async addWishlist(@Body() wishlistDto: WishlistDto, @Req() req) {
    return this.wishlistService.addWishlist(wishlistDto, req);
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Post('wishlist/listOfWishlist')
  async listOfWishlist(
    @Body() listOfWishlistDto: ListOfWishlistDto,
    @Req() req,
  ) {
    return this.wishlistService.listOfWishlist(listOfWishlistDto, req);
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Delete('wishlist/deleteWishlist/:id')
  @ApiParam({ example: 1, name: 'id', required: true })
  async deleteWishlist(@Param('id') id: number) {
    return this.wishlistService.deleteWishlist(id);
  }
}

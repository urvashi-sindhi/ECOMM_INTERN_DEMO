import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Delete,
  Param,
  Put,
  Get,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CreateProductDto, ProductListDto } from './dto/create-product.dto';
import { JwtGuard } from 'src/libs/services/auth/jwt.guard';
import { ProductsService } from './product.service';
import { Roles } from 'src/libs/helpers/decorators/roles.decorators';
import { UserRoles } from 'src/libs/utility/constants/enums';
import { RolesGuard } from 'src/libs/services/auth/roles.guard';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Roles(UserRoles.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @Post('addProduct')
  createProduct(@Body() dto: CreateProductDto) {
    return this.productsService.createProduct(dto);
  }

  @Post('listOfProducts')
  @HttpCode(HttpStatus.OK)
  listProducts(@Body() dto: ProductListDto) {
    return this.productsService.listOfProducts(dto);
  }

  @Get('viewProduct/:product_id')
  viewProduct(@Param('product_id') productId: number) {
    return this.productsService.viewProduct(productId);
  }

  @Roles(UserRoles.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiBearerAuth()
  @Get('productViewForAdmin/:product_id')
  viewProductForAdmin(@Param('product_id') productId: number) {
    return this.productsService.viewProductForAdmin(productId);
  }

  @Roles(UserRoles.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiBearerAuth()
  @Put('editProduct/:product_id')
  editProduct(
    @Param('product_id') productId: number,
    @Body() dto: CreateProductDto,
  ) {
    return this.productsService.editProduct(productId, dto);
  }

  @Roles(UserRoles.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @ApiBearerAuth()
  @Delete('deleteProduct/:product_id')
  deleteProduct(@Param('product_id') productId: number) {
    return this.productsService.deleteProduct(productId);
  }
}

import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { CartModel } from 'src/models/cart.model';
import { CartItemModel } from 'src/models/cart-item.model';
import { ProductVariantModel } from 'src/models/product-variant.model';
import { ProductModel } from 'src/models/product.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      CartModel,
      CartItemModel,
      ProductVariantModel,
      ProductModel,
    ]),
  ],
  providers: [CartService],
  controllers: [CartController],
  exports: [CartService],
})
export class CartModule {}

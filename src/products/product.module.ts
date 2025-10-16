import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProductModel } from '../models/product.model';
import { ProductImageModel } from '../models/product-image.model';
import { ProductsController } from './product.controller';
import { ProductsService } from './product.service';
import { ProductVariantModel } from 'src/models/product-variant.model';
import { CategoryModel } from 'src/models/category.model';
import { WishlistModel } from 'src/models/wishlist.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      ProductModel,
      ProductVariantModel,
      ProductImageModel,
      CategoryModel,
      WishlistModel,
    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule { }

import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CategoriesController } from './category.controller';
import { CategoriesService } from './category.service';
import { CategoryModel } from 'src/models/category.model';
import { ProductModel } from 'src/models/product.model';
import { ProductVariantModel } from 'src/models/product-variant.model';
import { ProductImageModel } from 'src/models/product-image.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      CategoryModel,
      ProductModel,
      ProductVariantModel,
      ProductImageModel,
    ]),
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}

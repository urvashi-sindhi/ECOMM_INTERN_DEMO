import { Module } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { WishlistModel } from 'src/models/wishlist.model';
import { ProductVariantModel } from 'src/models/product-variant.model';
import { UserModel } from 'src/models/user.model';
import { ProductImageModel } from 'src/models/product-image.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      WishlistModel,
      UserModel,
      ProductVariantModel,
      ProductImageModel,
    ]),
  ],
  providers: [WishlistService],
  controllers: [WishlistController],
  exports: [WishlistService],
})
export class WishlistModule { }

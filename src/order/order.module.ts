import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { OrderItemModel } from 'src/models/order-item.model';
import { OrderModel } from 'src/models/order.model';
import { ProductVariantModel } from 'src/models/product-variant.model';
import { CartItemModel } from 'src/models/cart-item.model';
import { CartModel } from 'src/models/cart.model';
import { ProductImageModel } from 'src/models/product-image.model';
import { PaymentModule } from 'src/payment/payment.module';
import { PaymentModel } from 'src/models/payment.model';
import { ProductModel } from 'src/models/product.model';
import { UserModel } from 'src/models/user.model';
import { CityModel } from 'src/models/city.model';
import { StateModel } from 'src/models/state.model';
import { CountryModel } from 'src/models/country.model';
import { AddressModel } from 'src/models/address.model';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    PaymentModule,
    SequelizeModule.forFeature([
      OrderItemModel,
      OrderModel,
      ProductVariantModel,
      CartModel,
      CartItemModel,
      ProductImageModel,
      PaymentModel,
      ProductModel,
      UserModel,
      CityModel,
      StateModel,
      CountryModel,
      AddressModel,
    ]),
    UserModule,
  ],
  providers: [OrderService],
  controllers: [OrderController],
  exports: [OrderService],
})
export class OrderModule {}

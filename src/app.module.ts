import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { SequelizeModule } from '@nestjs/sequelize';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { AppLogger } from './libs/helpers/logger';
import { UserModule } from './user/user.module';
import { UserModel } from './models/user.model';
import * as dotenv from 'dotenv';
import { AddressModel } from './models/address.model';
import { OtpModel } from './models/otp.model';
import { CityModel } from './models/city.model';
import { CountryModel } from './models/country.model';
import { StateModel } from './models/state.model';
import { CategoryModel } from './models/category.model';
import { CategoriesModule } from './category/category.module';
import { ProductVariantModel } from './models/product-variant.model';
import { ProductModel } from './models/product.model';
import { ProductImageModel } from './models/product-image.model';
import { ProductsModule } from './products/product.module';
import { WishlistModel } from './models/wishlist.model';
import { WishlistModule } from './wishlist/wishlist.module';
import { CartItemModel } from './models/cart-item.model';
import { CartModel } from './models/cart.model';
import { DashboardController } from './dashboard/dashboard.controller';
import { CartModule } from './cart/cart.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PaymentModule } from './payment/payment.module';
import { OrderModule } from './order/order.module';
import { OrderItemModel } from './models/order-item.model';
import { OrderModel } from './models/order.model';

dotenv.config();
@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      models: [
        UserModel,
        AddressModel,
        OtpModel,
        CityModel,
        CountryModel,
        StateModel,
        CategoryModel,
        WishlistModel,
        ProductVariantModel,
        ProductModel,
        ProductImageModel,
        CartItemModel,
        CartModel,
        OrderItemModel,
        OrderModel,
      ],
      autoLoadModels: true,
      synchronize: true,
      define: {
        timestamps: false,
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    }),
    ConfigModule.forRoot({ isGlobal: true }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    UserModule,
    CategoriesModule,
    ProductsModule,
    WishlistModule,
    CartModule,
    DashboardModule,
    PaymentModule,
    OrderModule,
  ],

  controllers: [AppController, DashboardController],
  providers: [AppService, AppLogger],
})
export class AppModule {}

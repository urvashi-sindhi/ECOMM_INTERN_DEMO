import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { OrderModel } from 'src/models/order.model';
import { OrderItemModel } from 'src/models/order-item.model';
import { ProductVariantModel } from 'src/models/product-variant.model';
import { UserModel } from 'src/models/user.model';
import { ProductModel } from 'src/models/product.model';
@Module({
  imports: [
    SequelizeModule.forFeature([
      OrderModel,
      OrderItemModel,
      ProductVariantModel,
      UserModel,
      ProductModel,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}

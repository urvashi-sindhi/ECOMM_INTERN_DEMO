import {
  AllowNull,
  BelongsTo,
  Column,
  Default,
  ForeignKey,
  Model,
  Sequelize,
  Table,
} from 'sequelize-typescript';
import { ProductModel } from './product.model';
import { ProductVariantModel } from './product-variant.model';
import { OrderModel } from './order.model';

@Table({ tableName: 'order_items' })
export class OrderItemModel extends Model<OrderItemModel> {
  @ForeignKey(() => ProductModel)
  @Column
  product_id: number;

  @ForeignKey(() => ProductVariantModel)
  @Column
  product_variant_id: number;

  @ForeignKey(() => OrderModel)
  @Column
  order_id: number;

  @AllowNull(false)
  @Column
  quantity: number;

  @AllowNull(false)
  @Column
  price_total: number;

  @Default(Sequelize.literal('CURRENT_TIMESTAMP'))
  @Column({
    type: 'TIMESTAMP',
  })
  declare createdAt: Date;

  @AllowNull(false)
  @Default(Sequelize.literal('CURRENT_TIMESTAMP'))
  @Column({
    type: 'TIMESTAMP',
  })
  declare updatedAt: Date;

  @BelongsTo(() => ProductModel)
  product: ProductModel;

  @BelongsTo(() => ProductVariantModel)
  product_variant: ProductVariantModel;

  @BelongsTo(() => OrderModel)
  order: OrderModel;
}

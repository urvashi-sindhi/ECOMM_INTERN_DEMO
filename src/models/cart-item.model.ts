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
import { CartModel } from './cart.model';

import { ProductVariantModel } from './product-variant.model';
import { ProductModel } from './product.model';

@Table({ tableName: 'cart_item' })
export class CartItemModel extends Model<CartItemModel> {
  @AllowNull(false)
  @ForeignKey(() => ProductModel)
  @Column
  product_id: number;

  @AllowNull(false)
  @ForeignKey(() => ProductVariantModel)
  @Column
  product_variant_id: number;

  @AllowNull(false)
  @ForeignKey(() => CartModel)
  @Column
  cart_id: number;

  @AllowNull(false)
  @Column
  quantity: number;

  @AllowNull(false)
  @Default(0)
  @Column
  price_total: number;

  @Default(Sequelize.literal('CURRENT_TIMESTAMP'))
  @Column({ type: 'TIMESTAMP' })
  declare createdAt: Date;

  @Default(Sequelize.literal('CURRENT_TIMESTAMP'))
  @Column({
    type: 'TIMESTAMP',
    defaultValue: Sequelize.literal(
      'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    ),
  })
  declare updatedAt: Date;

  @BelongsTo(() => ProductVariantModel)
  productVariant: ProductVariantModel;

  @BelongsTo(() => CartModel)
  cart: CartModel;

  @BelongsTo(() => ProductModel)
  productData: ProductModel;
}

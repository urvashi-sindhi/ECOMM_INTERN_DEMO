import {
  AllowNull,
  Column,
  Default,
  ForeignKey,
  HasMany,
  Model,
  Sequelize,
  Table,
} from 'sequelize-typescript';
import { UserModel } from './user.model';
import { CartItemModel } from './cart-item.model';

@Table({ tableName: 'cart' })
export class CartModel extends Model<CartModel> {
  @AllowNull(false)
  @ForeignKey(() => UserModel)
  @Column
  user_id: number;

  @AllowNull(false)
  @Default(0)
  @Column
  total_quantity: number;

  @AllowNull(false)
  @Default(0)
  @Column
  sub_total: number;

  @AllowNull(false)
  @Default(0)
  @Column
  total_price: number;

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

  @HasMany(() => CartItemModel, { foreignKey: 'cart_id' })
  cart_items: CartItemModel[];
}

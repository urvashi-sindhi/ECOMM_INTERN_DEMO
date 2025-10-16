import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  Model,
  Sequelize,
  Table,
} from 'sequelize-typescript';
import { UserModel } from './user.model';
import { OrderItemModel } from './order-item.model';
import { PaymentMode, PaymentStatus } from 'src/libs/utility/constants/enums';
import { AddressModel } from './address.model';

@Table({ tableName: 'orders' })
export class OrderModel extends Model<OrderModel> {
  @ForeignKey(() => UserModel)
  @Column
  user_id: number;

  @ForeignKey(() => AddressModel)
  @Column
  shipping_address_id: number;

  @ForeignKey(() => AddressModel)
  @Column
  billing_address_id: number;

  @AllowNull(false)
  @Default(false)
  @Column
  billingSameAsShipping: boolean;

  @AllowNull(false)
  @Column
  total_quantity: number;

  @AllowNull(false)
  @Column
  sub_total: number;

  @AllowNull(false)
  @Column
  total_price: number;

  @AllowNull(false)
  @Default(PaymentStatus.PENDING)
  @Column({
    type: DataType.ENUM(
      PaymentStatus.PENDING,
      PaymentStatus.CANCEL,
      PaymentStatus.SUCCESS,
    ),
  })
  status: string;

  @AllowNull(false)
  @Default('Order')
  @Column
  order_name: string;

  @AllowNull(false)
  @Column({ type: DataType.ENUM(PaymentMode.ONLINE, PaymentMode.COD) })
  payment_mode: string;

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

  @BelongsTo(() => UserModel)
  user: UserModel;

  @BelongsTo(() => AddressModel, {
    as: 'shippingAddress',
    foreignKey: 'shipping_address_id',
  })
  shippingAddress: AddressModel;

  @BelongsTo(() => AddressModel, {
    as: 'billingAddress',
    foreignKey: 'billing_address_id',
  })
  billingAddress: AddressModel;

  @HasMany(() => OrderItemModel)
  orderItems: OrderItemModel[];
}

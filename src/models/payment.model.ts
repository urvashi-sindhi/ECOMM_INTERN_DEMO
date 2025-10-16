import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  Sequelize,
  Table,
} from 'sequelize-typescript';
import { OrderModel } from './order.model';

@Table({
  tableName: 'payments',
})
export class PaymentModel extends Model<PaymentModel> {
  @ForeignKey(() => OrderModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  order_id: number;

  @AllowNull(false)
  @Column
  payment_id: string;

  @AllowNull(false)
  @Column
  status: string;

  @AllowNull(false)
  @Column
  total_payment: number;

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

  @BelongsTo(() => OrderModel)
  order: OrderModel;
}

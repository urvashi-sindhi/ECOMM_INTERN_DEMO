import {
  Table,
  Model,
  Column,
  AllowNull,
  Default,
  ForeignKey,
  Sequelize,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { UserModel } from './user.model';
import { CityModel } from './city.model';
import { StateModel } from './state.model';
import { CountryModel } from './country.model';
import { OrderModel } from './order.model';
@Table({ tableName: 'address' })
export class AddressModel extends Model<AddressModel> {
  @AllowNull(false)
  @ForeignKey(() => UserModel)
  @Column
  user_id: number;

  @ForeignKey(() => CountryModel)
  @AllowNull(false)
  @Column
  country_id: number;

  @ForeignKey(() => StateModel)
  @AllowNull(false)
  @Column
  state_id: number;

  @ForeignKey(() => CityModel)
  @AllowNull(false)
  @Column
  city_id: number;

  @AllowNull(true)
  @Default(null)
  @Column
  name: string;

  @AllowNull(true)
  @Default(null)
  @Column
  phone_number: string;

  @AllowNull(false)
  @Column
  postal_code: number;

  @AllowNull(true)
  @Column
  label: string;

  @AllowNull(false)
  @Column
  address_line1: string;

  @AllowNull(true)
  @Column
  address_line2: string;

  @AllowNull(true)
  @Default(false)
  @Column
  home_address: boolean;

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

  @BelongsTo(() => UserModel)
  users: UserModel;

  @BelongsTo(() => CountryModel)
  country: CountryModel;

  @BelongsTo(() => StateModel)
  state: StateModel;

  @BelongsTo(() => CityModel)
  city: CityModel;

  @HasMany(() => OrderModel, {
    as: 'shippingOrders',
    foreignKey: 'shipping_address_id',
  })
  shippingOrders: OrderModel[];

  @HasMany(() => OrderModel, {
    as: 'billingOrders',
    foreignKey: 'billing_address_id',
  })
  billingOrders: OrderModel[];
}

import {
  Table,
  Model,
  Column,
  ForeignKey,
  BelongsTo,
  AllowNull,
  Unique,
  Default,
  HasMany,
} from 'sequelize-typescript';
import { StateModel } from './state.model';
import { Sequelize } from 'sequelize';
import { AddressModel } from './address.model';

@Table({
  tableName: 'city',
})
export class CityModel extends Model<CityModel> {
  @AllowNull(false)
  @Unique(true)
  @Column
  city_name: string;

  @ForeignKey(() => StateModel)
  @AllowNull(false)
  @Column
  state_id: number;

  @BelongsTo(() => StateModel)
  state: StateModel;

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

  @HasMany(() => AddressModel)
  states: AddressModel[];
}

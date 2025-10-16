import {
  Table,
  Model,
  Column,
  HasMany,
  AllowNull,
  Unique,
  Default,
} from 'sequelize-typescript';
import { StateModel } from './state.model';
import { Sequelize } from 'sequelize';
import { AddressModel } from './address.model';

@Table({
  tableName: 'country',
})
export class CountryModel extends Model<CountryModel> {
  @AllowNull(false)
  @Unique(true)
  @Column
  country_name: string;

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

  @HasMany(() => StateModel)
  states: StateModel[];

  @HasMany(() => AddressModel)
  country: AddressModel[];
}

import {
  Table,
  Model,
  Column,
  ForeignKey,
  BelongsTo,
  HasMany,
  AllowNull,
  Unique,
  Default,
} from 'sequelize-typescript';
import { CountryModel } from './country.model';
import { CityModel } from './city.model';
import { Sequelize } from 'sequelize';
import { AddressModel } from './address.model';

@Table({
  tableName: 'state',
})
export class StateModel extends Model<StateModel> {
  @AllowNull(false)
  @Unique(true)
  @Column
  state_name: string;

  @ForeignKey(() => CountryModel)
  @AllowNull(false)
  @Column
  country_id: number;

  @BelongsTo(() => CountryModel)
  country: CountryModel;

  @HasMany(() => CityModel)
  cities: CityModel[];

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

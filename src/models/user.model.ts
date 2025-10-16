import { MaxLength } from 'class-validator';
import {
  Table,
  Model,
  Column,
  IsEmail,
  Default,
  AllowNull,
  Sequelize,
  HasOne,
  HasMany,
} from 'sequelize-typescript';
import { AddressModel } from './address.model';

@Table({ tableName: 'users' })
export class UserModel extends Model<UserModel> {
  @AllowNull(false)
  @MaxLength(50)
  @Column
  name: string;

  @AllowNull(false)
  @IsEmail
  @Column
  email: string;

  @AllowNull(false)
  @Column
  password: string;

  @AllowNull(false)
  @Column
  phone_number: string;

  @AllowNull(false)
  @Column
  gender: string;

  @AllowNull(true)
  @Column
  profile_image: string;

  @AllowNull(false)
  @Default('customer')
  @Column
  role: string;

  @AllowNull(false)
  @Default(false)
  @Column
  is_deleted: boolean;

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

  @HasMany(() => AddressModel, { foreignKey: 'user_id' })
  address: AddressModel[];
}

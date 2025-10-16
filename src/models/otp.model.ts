import { MaxLength } from 'class-validator';
import {
  Table,
  Model,
  AllowNull,
  Column,
  IsEmail,
  Default,
  Sequelize,
} from 'sequelize-typescript';

@Table({ tableName: 'otp' })
export class OtpModel extends Model<OtpModel> {
  @AllowNull(false)
  @MaxLength(50)
  @IsEmail
  @Column
  email: string;

  @AllowNull(false)
  @Column
  otp: number;

  @Default(Sequelize.literal('CURRENT_TIMESTAMP'))
  @Column({
    type: 'TIMESTAMP',
  })
  @Column({ type: 'TIMESTAMP' })
  expiry_time: Date;

  @Default(Sequelize.literal('CURRENT_TIMESTAMP'))
  @Column({ type: 'TIMESTAMP' })
  declare createdAt: Date;

  @Default(Sequelize.literal('CURRENT_TIMESTAMP'))
  @Column({
    type: 'TIMESTAMP',
  })
  declare updatedAt: Date;
}

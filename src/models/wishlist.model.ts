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
import { UserModel } from './user.model';
import { ProductVariantModel } from './product-variant.model';

@Table({ tableName: 'wishlist' })
export class WishlistModel extends Model<WishlistModel> {
  @AllowNull(false)
  @ForeignKey(() => UserModel)
  @Column
  user_id: number;

  @BelongsTo(() => UserModel)
  users: UserModel;

  @AllowNull(false)
  @ForeignKey(() => ProductVariantModel)
  @Column
  product_variant_id: number;

  @BelongsTo(() => ProductVariantModel)
  product_variant: ProductVariantModel;

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
}

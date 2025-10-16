import {
  Table,
  Model,
  Column,
  ForeignKey,
  BelongsTo,
  HasOne,
  Default,
  AllowNull,
  HasMany,
} from 'sequelize-typescript';
import { ProductModel } from './product.model';
import { ProductImageModel } from './product-image.model';
import { Sequelize } from 'sequelize';
import { WishlistModel } from './wishlist.model';

@Table({
  tableName: 'product_variants',
})
export class ProductVariantModel extends Model<ProductVariantModel> {
  @AllowNull(false)
  @Column
  product_title_name: string;

  @ForeignKey(() => ProductModel)
  @AllowNull(false)
  @Column
  product_id: number;

  @BelongsTo(() => ProductModel)
  product: ProductModel;

  @AllowNull(true)
  @Column
  description: string;

  @AllowNull(true)
  @Column
  color: string;

  @AllowNull(false)
  @Column
  quantity: number;

  @AllowNull(false)
  @Column
  size: string;

  @AllowNull(false)
  @Column
  price: number;

  @Default(false)
  @Column
  isDeleted: boolean;

  @HasOne(() => ProductImageModel)
  image: ProductImageModel;

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

  @HasMany(() => WishlistModel, { foreignKey: 'product_variant_id' })
  wishlist: WishlistModel[];
}

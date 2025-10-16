import {
  Table,
  Model,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
  Default,
  AllowNull,
} from 'sequelize-typescript';
import { CategoryModel } from './category.model';
import { Sequelize } from 'sequelize';
import { ProductVariantModel } from './product-variant.model';

@Table({
  tableName: 'products',
})
export class ProductModel extends Model<ProductModel> {
  @AllowNull(false)
  @Column
  declare name: string;

  @ForeignKey(() => CategoryModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare category_id: number;

  @BelongsTo(() => CategoryModel)
  category: CategoryModel;

  @Default(false)
  @Column
  declare isDeleted: boolean;

  @HasMany(() => ProductVariantModel)
  variants: ProductVariantModel[];

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

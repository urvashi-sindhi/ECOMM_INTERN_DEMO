import {
  Table,
  Model,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  Default,
  Sequelize,
} from 'sequelize-typescript';
import { ProductVariantModel } from './product-variant.model';

@Table({ tableName: 'product_images' })
export class ProductImageModel extends Model<ProductImageModel> {
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  image_path: string;

  @ForeignKey(() => ProductVariantModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  product_variant_id: number;

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

  @BelongsTo(() => ProductVariantModel)
  variant: ProductVariantModel;
}

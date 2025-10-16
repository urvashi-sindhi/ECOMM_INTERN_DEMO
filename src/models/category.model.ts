import { Sequelize } from 'sequelize';
import {
  Column,
  Model,
  Table,
  AllowNull,
  Default,
  HasMany,
} from 'sequelize-typescript';
import { ProductModel } from './product.model';

@Table({
  tableName: 'category',
})
export class CategoryModel extends Model<CategoryModel> {
  @AllowNull(false)
  @Column
  category_name: string;

  @AllowNull(true)
  @Column
  category_image: string;

  @AllowNull(true)
  @Column
  description: string;

  @AllowNull(false)
  @Default(false)
  @Column
  isDeleted: boolean;

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

  @HasMany(() => ProductModel)
  product: ProductModel[];
}

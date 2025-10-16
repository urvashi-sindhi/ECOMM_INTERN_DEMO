import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { ProductModel } from '../models/product.model';
import { ProductImageModel } from '../models/product-image.model';
import { CreateProductDto, ProductListDto } from './dto/create-product.dto';
import { GeneralResponse } from '../libs/services/generalResponse';
import { Messages } from '../libs/utility/constants/message';
import { ProductVariantModel } from 'src/models/product-variant.model';
import { ResponseData } from 'src/libs/utility/constants/response';
import { pagination, sorting } from 'src/libs/services/commonFunction';
import { Op } from 'sequelize';
import { CategoryModel } from 'src/models/category.model';
import { WishlistModel } from 'src/models/wishlist.model';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(ProductModel)
    private readonly productModel: typeof ProductModel,
    @InjectModel(ProductVariantModel)
    private readonly variantModel: typeof ProductVariantModel,
    @InjectModel(ProductImageModel)
    private readonly imageModel: typeof ProductImageModel,
    private readonly sequelize: Sequelize,
    @InjectModel(CategoryModel)
    private readonly categoryModel: typeof CategoryModel,
    @InjectModel(WishlistModel)
    private readonly wishlistModel: typeof WishlistModel,
  ) {}

  async createProduct(dto: CreateProductDto) {
    const transaction = await this.sequelize.transaction();
    const { name, category_id, product_variants } = dto;

    try {
      const product = await this.productModel.create(
        {
          name,
          category_id,
        } as any,
        { transaction },
      );

      for (const variant of product_variants) {
        const createdVariant = await this.variantModel.create(
          {
            product_title_name: variant.product_title_name,
            description: variant.description,
            color: variant.color,
            size: variant.size,
            price: variant.price,
            quantity: variant.quantity,
            product_id: product.id,
          } as any,
          { transaction },
        );

        if (variant.variant_image) {
          await this.imageModel.create(
            {
              image_path: variant.variant_image.image_path,
              product_variant_id: createdVariant.id,
            } as any,
            { transaction },
          );
        }
      }

      await transaction.commit();

      Logger.log(`Product ${Messages.ADD_SUCCESS}`);
      return GeneralResponse(
        HttpStatus.CREATED,
        ResponseData.SUCCESS,
        `Product ${Messages.ADD_SUCCESS}`,
        { id: product?.id },
      );
    } catch (error) {
      await transaction.rollback();
      Logger.error(Messages.SERVER_ERROR);
      return GeneralResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseData.ERROR,
        Messages.SERVER_ERROR,
      );
    }
  }

  async listOfProducts(dto: ProductListDto) {
    const {
      search,
      page = 1,
      pageSize = 10,
      sortValue,
      sortKey,
      user_id,
    } = dto;
    const sortQuery = sorting(sortKey as any, sortValue as any);

    const whereCondition: any = {
      attributes: ['id', 'name', 'createdAt'],
      include: [
        {
          model: this.categoryModel,
          attributes: ['id', 'category_name'],
        },
        {
          model: ProductVariantModel,
          attributes: ['id', 'product_title_name', 'color', 'price'],
          include: [
            {
              model: ProductImageModel,
              attributes: ['image_path'],
            },
          ],
        },
      ],
      order: sortQuery,
      distinct: true,
      where: {},
    };

    if (search) {
      const productCondition = {
        name: { [Op.like]: `%${search}%` },
      };

      const categoryCondition = {
        '$category.category_name$': { [Op.like]: `%${search}%` },
      };

      whereCondition.where = {
        [Op.or]: [productCondition, categoryCondition],
      };
      whereCondition.include[0].required = !!search;
    }

    const paginationResult = await pagination(
      this.productModel,
      page,
      pageSize,
      whereCondition,
      'products',
    );

    if (paginationResult.products.length === 0) {
      Logger.log(`Product ${Messages.NOT_FOUND}`);
      return GeneralResponse(
        HttpStatus.NOT_FOUND,
        ResponseData.ERROR,
        `Product ${Messages.NOT_FOUND}`,
      );
    }

    if (user_id) {
      for (const product of paginationResult.products) {
        const variants = product.dataValues?.variants;
        for (const variant of variants) {
          const variantData = variant.dataValues;
          const wishlistEntry = await this.wishlistModel.findOne({
            where: { user_id, product_variant_id: variantData.id },
          });
          variantData.is_wishlist = !!wishlistEntry;
        }
      }
    }

    Logger.log(`Products ${Messages.GETTING_SUCCESS}`);
    return GeneralResponse(
      HttpStatus.OK,
      ResponseData.SUCCESS,
      `Products ${Messages.GETTING_SUCCESS}`,
      paginationResult,
    );
  }

  async viewProduct(productId: number) {
    const options: any = {
      attributes: ['id', 'name'],
      include: [
        {
          model: ProductVariantModel,
          attributes: ['id', 'product_title_name', 'color', 'price'],
          include: [
            {
              model: ProductImageModel,
              attributes: ['image_path'],
            },
          ],
        },
      ],
    };

    const findproduct = await this.productModel.findByPk(productId, options);

    if (!findproduct) {
      return GeneralResponse(
        HttpStatus.NOT_FOUND,
        ResponseData.ERROR,
        `Product ${Messages.NOT_FOUND}`,
      );
    }

    Logger.log(`Product ${Messages.GETTING_SUCCESS}`);
    return GeneralResponse(
      HttpStatus.OK,
      ResponseData.SUCCESS,
      `Product ${Messages.GETTING_SUCCESS}`,
      findproduct,
    );
  }

  async viewProductForAdmin(productId: number) {
    const options: any = {
      attributes: ['id', 'name'],
      include: [
        {
          model: this.categoryModel,
          attributes: ['id', 'category_name'],
        },
        {
          model: ProductVariantModel,
          attributes: [
            'id',
            'product_title_name',
            'color',
            'price',
            'description',
            'size',
            'quantity',
          ],
          include: [
            {
              model: ProductImageModel,
              attributes: ['image_path'],
            },
          ],
        },
      ],
    };

    const findProduct = await this.productModel.findByPk(productId, options);

    if (!findProduct) {
      Logger.log(`Product ${Messages.NOT_FOUND}`);
      return GeneralResponse(
        HttpStatus.NOT_FOUND,
        ResponseData.ERROR,
        `Product ${Messages.NOT_FOUND}`,
      );
    }

    Logger.log(`Product ${Messages.GETTING_SUCCESS}`);
    return GeneralResponse(
      HttpStatus.OK,
      ResponseData.SUCCESS,
      `Product ${Messages.GETTING_SUCCESS}`,
      findProduct,
    );
  }

  async editProduct(productId: number, dto: CreateProductDto) {
    const transaction = await this.sequelize.transaction();
    const { name, category_id } = dto;
    try {
      const findproduct = await this.productModel.findByPk(productId);

      if (!findproduct) {
        return GeneralResponse(
          HttpStatus.NOT_FOUND,
          ResponseData.ERROR,
          `Product ${Messages.NOT_FOUND}`,
        );
      }

      await findproduct.update({ name, category_id }, { transaction });

      const existingVariants = await this.variantModel.findAll({
        where: { product_id: productId },
        transaction,
      });

      if (existingVariants && existingVariants.length > 0) {
        await this.imageModel.destroy({
          where: {
            product_variant_id: existingVariants.map((item) => item.id),
          },
          transaction,
        });

        await this.variantModel.destroy({
          where: { product_id: productId },
          transaction,
        });
      }

      for (const variant of dto.product_variants) {
        const createdVariant = await this.variantModel.create(
          {
            product_title_name: variant.product_title_name,
            description: variant.description,
            color: variant.color,
            size: variant.size,
            price: variant.price,
            quantity: variant.quantity,
            product_id: productId,
          } as any,
          { transaction },
        );

        if (variant.variant_image) {
          await this.imageModel.create(
            {
              image_path: variant.variant_image.image_path,
              product_variant_id: createdVariant.id,
            } as any,
            { transaction },
          );
        }
      }
      await transaction.commit();
      Logger.log(Messages.UPDATE_SUCCESS);
      return GeneralResponse(
        HttpStatus.OK,
        ResponseData.SUCCESS,
        Messages.UPDATE_SUCCESS,
      );
    } catch (error) {
      await transaction.rollback();
      Logger.error(Messages.SERVER_ERROR);
      throw GeneralResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseData.ERROR,
        Messages.INTERNAL_SERVER_ERROR,
        error.message,
      );
    }
  }

  async deleteProduct(productId: number) {
    const transaction = await this.sequelize.transaction();

    try {
      const findproduct = await this.productModel.findByPk(productId);
      if (!findproduct) {
        return GeneralResponse(
          HttpStatus.NOT_FOUND,
          ResponseData.ERROR,
          Messages.NOT_FOUND,
          null,
        );
      }

      const variants = await this.variantModel.findAll({
        where: { product_id: productId },
        transaction,
      });

      await this.imageModel.destroy({
        where: {
          product_variant_id: variants.map((v) => v.id),
        },
        transaction,
      });

      await this.variantModel.destroy({
        where: { product_id: productId },
        transaction,
      });

      await findproduct.destroy({ transaction });

      await transaction.commit();

      return GeneralResponse(
        HttpStatus.OK,
        ResponseData.SUCCESS,
        `Product ${Messages.DELETE_SUCCESS}`,
      );
    } catch (error) {
      await transaction.rollback();
      Logger.error(Messages.SERVER_ERROR);
      throw GeneralResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseData.ERROR,
        Messages.INTERNAL_SERVER_ERROR,
        error.message,
      );
    }
  }
}

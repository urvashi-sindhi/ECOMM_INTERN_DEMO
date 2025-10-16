import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { GeneralResponse } from 'src/libs/services/generalResponse';
import { Messages } from 'src/libs/utility/constants/message';
import { ResponseData } from 'src/libs/utility/constants/response';
import { CategoryModel } from 'src/models/category.model';
import { pagination, sorting } from 'src/libs/services/commonFunction';
import { Op, Sequelize, where } from 'sequelize';
import { CategoryListDto } from './dto/listcategory.dto';
import { ProductModel } from 'src/models/product.model';
import { ProductVariantModel } from 'src/models/product-variant.model';
import { ProductImageModel } from 'src/models/product-image.model';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(CategoryModel)
    private readonly categoryModel: typeof CategoryModel,
    @InjectModel(ProductModel)
    private readonly productModel: typeof ProductModel,
    @InjectModel(ProductVariantModel)
    private readonly productVariantModel: typeof ProductVariantModel,
    @InjectModel(ProductImageModel)
    private readonly imageModel: typeof ProductImageModel,
  ) {}

  async addCategory(dto: any) {
    const findCategory = await this.categoryModel.findOne({
      where: { category_name: dto.category_name },
    });

    if (findCategory) {
      Logger.error(`Category ${Messages.ALREADY_EXIST}`);
      return GeneralResponse(
        HttpStatus.CONFLICT,
        ResponseData.ERROR,
        `Category ${Messages.ALREADY_EXIST}`,
      );
    }

    const createCategory = await this.categoryModel.create(dto);
    Logger.log(`Category ${Messages.ADD_SUCCESS}`);
    return GeneralResponse(
      HttpStatus.CREATED,
      ResponseData.SUCCESS,
      `Category ${Messages.ADD_SUCCESS}`,
      { id: createCategory.id },
    );
  }

  async updateCategory(category_id: number, dto: UpdateCategoryDto) {
    const { category_name, category_image, description } = dto;
    const findCategory = await this.categoryModel.findOne({
      where: { id: category_id },
    });

    if (!findCategory) {
      Logger.error(`Category ${Messages.NOT_FOUND}`);
      return GeneralResponse(
        HttpStatus.NOT_FOUND,
        ResponseData.ERROR,
        `Category ${Messages.NOT_FOUND}`,
      );
    }

    if (findCategory.category_name === category_name) {
      Logger.error(`Category ${Messages.ALREADY_EXIST}`);
      return GeneralResponse(
        HttpStatus.CONFLICT,
        ResponseData.ERROR,
        `Category ${Messages.ALREADY_EXIST}`,
      );
    }

    await this.categoryModel.update(
      { category_name, category_image, description },
      { where: { id: category_id } },
    );

    Logger.log(`Category ${Messages.UPDATE_SUCCESS}`);
    return GeneralResponse(
      HttpStatus.ACCEPTED,
      ResponseData.SUCCESS,
      `Category ${Messages.UPDATE_SUCCESS}`,
    );
  }

  async deleteCategory(category_id: number) {
    const findCategory = await this.categoryModel.findOne({
      where: { id: category_id, isDeleted: false },
    });

    if (!findCategory) {
      Logger.error(`Category ${Messages.NOT_FOUND}`);
      return GeneralResponse(
        HttpStatus.NOT_FOUND,
        ResponseData.ERROR,
        `Category ${Messages.NOT_FOUND}`,
      );
    }

    await this.categoryModel.update(
      { isDeleted: true },
      {
        where: { id: category_id },
      },
    );

    Logger.log(`Category ${Messages.DELETE_SUCCESS}`);
    return GeneralResponse(
      HttpStatus.OK,
      ResponseData.SUCCESS,
      `Category ${Messages.DELETE_SUCCESS}`,
    );
  }

  async viewCategory(category_id: number) {
    const category = await this.categoryModel.findOne({
      where: { id: category_id, isDeleted: false },
      attributes: ['id', 'category_name', 'category_image', 'description'],
    });

    if (!category) {
      Logger.error(`Category ${Messages.NOT_FOUND}`);
      return GeneralResponse(
        HttpStatus.NOT_FOUND,
        ResponseData.ERROR,
        `Category ${Messages.NOT_FOUND}`,
      );
    }

    Logger.log(`Category ${Messages.GETTING_SUCCESS}`);
    return GeneralResponse(
      HttpStatus.OK,
      ResponseData.SUCCESS,
      undefined,
      category,
    );
  }

  async listOfCategories(dto: CategoryListDto) {
    const { search, page = 1, pageSize = 10, sortValue, sortKey } = dto;
    const sortQuery = sorting(sortKey as any, sortValue as any);

    const whereClause = {
      isDeleted: false,
      ...(search && {
        category_name: {
          [Op.like]: `%${search}%`,
        },
      }),
    };

    const totalItems = await this.categoryModel.count({ where: whereClause });

    const categories = await this.categoryModel.findAll({
      attributes: [
        'id',
        'category_name',
        'category_image',
        'description',
        'createdAt',
      ],
      where: whereClause,
      include: [
        {
          model: this.productModel,
          required: false,
          attributes: ['name', 'category_id'],
          include: [
            {
              model: this.productVariantModel,
              required: false,
              attributes: [
                'id',
                'product_title_name',
                'product_id',
                'description',
                'color',
                'quantity',
                'size',
                'price',
              ],
              include: [
                {
                  model: this.imageModel,
                  required: false,
                  attributes: ['image_path'],
                },
              ],
            },
          ],
        },
      ],
      order: sortQuery,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

    const result = {
      categories,
      totalItems,
      totalPage: Math.ceil(totalItems / pageSize),
      currentPage: page,
      pageSize,
      numberOfRows: categories.length,
    };

    if (!categories.length) {
      Logger.error(`Category ${Messages.NOT_FOUND}`);
      return GeneralResponse(
        HttpStatus.NOT_FOUND,
        ResponseData.ERROR,
        `Category ${Messages.NOT_FOUND}`,
      );
    }

    Logger.log(`Categories ${Messages.GETTING_SUCCESS}`);
    return GeneralResponse(
      HttpStatus.OK,
      ResponseData.SUCCESS,
      `Categories ${Messages.GETTING_SUCCESS}`,
      result,
    );
  }

  async categoryOfProducts(dto: any) {
    const { category_id, page, pageSize, sortKey, sortValue, search } = dto;
    const sortQuery = sorting(sortKey as any, sortValue as any);

    const category = await this.categoryModel.findOne({
      where: { id: category_id },
      attributes: [
        'id',
        'category_name',
        'category_image',
        'description',
        'createdAt',
      ],
    });

    if (!category) {
      Logger.log(`Category ${Messages.NOT_FOUND}`);
      return GeneralResponse(
        HttpStatus.NOT_FOUND,
        ResponseData.ERROR,
        `Category ${Messages.NOT_FOUND}`,
      );
    }

    const productWhere: any = { category_id };
    if (search) {
      productWhere[Op.or] = [{ name: { [Op.like]: `%${search}%` } }];
    }

    const productQuery = {
      where: productWhere,
      include: [
        {
          model: this.productVariantModel,
          required: false,
          attributes: [
            'id',
            'product_title_name',
            'product_id',
            'description',
            'color',
            'quantity',
            'size',
            'price',
          ],
          include: [
            {
              model: this.imageModel,
              required: false,
              attributes: ['image_path'],
            },
          ],
        },
      ],
      order: sortQuery,
    };

    const productsResult = await pagination(
      this.productModel,
      page,
      pageSize,
      productQuery,
      'products',
    );

    const result = {
      categories: [
        {
          ...category.get({ plain: true }),
          products: productsResult.products,
        },
      ],
      totalItems: productsResult.totalItems,
      totalPage: productsResult.totalPage,
      currentPage: productsResult.currentPage,
      pageSize: productsResult.pageSize,
      numberOfRows: productsResult.numberOfRows,
    };

    Logger.log(`Category products ${Messages.GETTING_SUCCESS}`);
    return GeneralResponse(
      HttpStatus.OK,
      ResponseData.SUCCESS,
      `Category products ${Messages.GETTING_SUCCESS}`,
      result,
    );
  }

  async categoryDropdown() {
    const dataOfCategory = await this.categoryModel.findAll({
      where: { isDeleted: false },
      attributes: [
        'id',
        'category_name',
        'category_image',
        'description',
        [Sequelize.fn('COUNT', Sequelize.col('product.id')), 'productCount'],
      ],
      include: [
        {
          model: this.productModel,
          required: false,
          attributes: [],
        },
      ],
      group: ['id'],
    });

    if (dataOfCategory.length === 0) {
      return GeneralResponse(
        HttpStatus.NOT_FOUND,
        ResponseData.ERROR,
        `Category ${Messages.NOT_FOUND}`,
      );
    }

    return GeneralResponse(
      HttpStatus.OK,
      ResponseData.SUCCESS,
      undefined,
      dataOfCategory,
    );
  }
}

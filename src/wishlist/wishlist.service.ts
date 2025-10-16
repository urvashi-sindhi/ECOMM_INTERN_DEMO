import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { pagination, sorting } from 'src/libs/services/commonFunction';
import { GeneralResponse } from 'src/libs/services/generalResponse';
import { Messages } from 'src/libs/utility/constants/message';
import { ResponseData } from 'src/libs/utility/constants/response';
import { WishlistModel } from 'src/models/wishlist.model';
import { UserModel } from 'src/models/user.model';
import { ProductVariantModel } from 'src/models/product-variant.model';
import { ProductImageModel } from 'src/models/product-image.model';

@Injectable()
export class WishlistService {
  constructor(
    @InjectModel(WishlistModel)
    private readonly wishlistModel: typeof WishlistModel,
    @InjectModel(UserModel)
    private readonly userModel: typeof UserModel,
    @InjectModel(ProductVariantModel)
    private readonly productVariantModel: typeof ProductVariantModel,
    @InjectModel(ProductImageModel)
    private readonly productImageModel: typeof ProductImageModel,
  ) {}

  async addWishlist(dto: any, req: any) {
    const user_id = req.user.id;

    const existingProduct = await this.wishlistModel.findOne({
      where: { product_variant_id: dto.product_variant_id, user_id },
    });

    if (existingProduct) {
      Logger.error(`Product ${Messages.ALREADY_EXIST}`);
      return GeneralResponse(
        HttpStatus.CONFLICT,
        ResponseData.ERROR,
        `Product ${Messages.ALREADY_EXIST}`,
      );
    }

    await this.wishlistModel.create({ ...dto, user_id });

    Logger.log(`Wishlist ${Messages.ADD_SUCCESS}`);
    return GeneralResponse(
      HttpStatus.CREATED,
      ResponseData.SUCCESS,
      `Wishlist ${Messages.ADD_SUCCESS}`,
    );
  }

  async deleteWishlist(id: number) {
    const findWishlist = await this.wishlistModel.findOne({ where: { id } });

    if (!findWishlist) {
      Logger.error(`Product ${Messages.NOT_FOUND}`);
      return GeneralResponse(
        HttpStatus.NOT_FOUND,
        ResponseData.ERROR,
        `Product ${Messages.NOT_FOUND}`,
      );
    }

    await this.wishlistModel.destroy({ where: { id } });

    Logger.log(`${Messages.REMOVED_FROM_WISHLIST}`);
    return GeneralResponse(
      HttpStatus.OK,
      ResponseData.SUCCESS,
      `${Messages.REMOVED_FROM_WISHLIST}`,
    );
  }

  async listOfWishlist(dto: any, req: any) {
    const user_id = req.user.id;
    const { search, pageSize, page, sortValue, sortKey } = dto;
    const sortQuery = sorting(sortKey, sortValue);

    const whereCondition: any = {
      attributes: [
        'id',
        'user_id',
        'product_variant_id',
        'createdAt',
        'updatedAt',
      ],
      include: [
        {
          model: this.userModel,
          attributes: ['id', 'name'],
        },
        {
          model: this.productVariantModel,
          attributes: [
            'id',
            'product_id',
            'product_title_name',
            'description',
            'color',
            'price',
          ],
          include: [
            {
              model: this.productImageModel,
              as: 'image',
              attributes: ['image_path'],
              required: false,
            },
          ],
        },
      ],
      order: sortQuery,
      where: { user_id },
    };

    if (search) {
      whereCondition.where[Op.or] = [
        { '$users.name$': { [Op.like]: `%${search}%` } },
        { '$users.email$': { [Op.like]: `%${search}%` } },
        { '$product.product_title_name$': { [Op.like]: `%${search}%` } },
      ];
    }

    const paginationResult = await pagination(
      this.wishlistModel,
      page,
      pageSize,
      whereCondition,
      'wishlist',
    );

    Logger.log(`Wishlist ${Messages.GETTING_SUCCESS}`);
    return GeneralResponse(
      HttpStatus.OK,
      ResponseData.SUCCESS,
      `Wishlist ${Messages.GETTING_SUCCESS}`,
      paginationResult,
    );
  }
}

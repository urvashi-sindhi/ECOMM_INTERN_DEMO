import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CartItemModel } from 'src/models/cart-item.model';
import { CartModel } from 'src/models/cart.model';
import { ProductVariantModel } from 'src/models/product-variant.model';
import { GeneralResponse } from 'src/libs/services/generalResponse';
import { ResponseData } from 'src/libs/utility/constants/response';
import { Messages } from 'src/libs/utility/constants/message';
import { ProductImageModel } from 'src/models/product-image.model';
import { ProductModel } from 'src/models/product.model';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(CartModel) private readonly cartModel: typeof CartModel,
    @InjectModel(CartItemModel)
    private readonly cartItemModel: typeof CartItemModel,
    @InjectModel(ProductVariantModel)
    private readonly productVariantModel: typeof ProductVariantModel,
    @InjectModel(ProductModel)
    private readonly productModel: typeof ProductModel,
  ) {}

  async checkCart(cartID: number) {
    const findCart: any = await this.cartModel.findOne({
      where: {
        id: cartID,
      },
      include: [
        {
          model: this.cartItemModel,
          as: 'cart_items',
          include: [
            {
              model: this.productVariantModel,
              as: 'productVariant',
              attributes: ['price'],
            },
          ],
        },
      ],
    });

    for (let item of findCart.dataValues.cart_items) {
      const amount =
        item.dataValues.quantity *
        item.dataValues.productVariant.dataValues.price;

      await this.cartItemModel.update(
        { price_total: amount },
        { where: { id: item.id } },
      );
    }

    const findCartItem = await this.cartItemModel.findAll({
      where: { cart_id: cartID },
    });

    const totalAmount: any = [];
    const totalQuantity: any = [];

    for (let item of findCartItem) {
      totalQuantity.push(item.dataValues.quantity);
      totalAmount.push(item.dataValues.price_total);
    }

    const total_price = totalAmount.reduce((sum, item) => sum + item, 0);
    const total_quantity = totalQuantity.reduce((sum, item) => sum + item, 0);

    await this.cartModel.update(
      { total_price, sub_total: total_price, total_quantity },
      { where: { id: cartID } },
    );
  }

  async addToCart(dto: any, req: any) {
    const { cart_items } = dto;
    const { product_id, product_variant_id, quantity }: any = cart_items[0];
    const user_id = req.user.id;

    const checkProductStock: any = await this.productVariantModel.findOne({
      where: { id: product_variant_id },
    });

    if (checkProductStock.dataValues.quantity < quantity) {
      Logger.log(`Product ${Messages.OUT_OF_STOCK}`);
      return GeneralResponse(
        HttpStatus.CREATED,
        ResponseData.SUCCESS,
        `Product ${Messages.OUT_OF_STOCK}`,
      );
    }

    const findCart = await this.cartModel.findOne({ where: { user_id } });

    if (!findCart) {
      const cartData = await this.cartModel.create({ user_id } as any);
      const createData: any = {
        cart_id: cartData?.dataValues.id,
        product_id,
        product_variant_id,
        quantity,
      };

      await this.cartItemModel.create(createData);
      await this.checkCart(cartData?.dataValues.id);

      Logger.log(`Cart ${Messages.ADD_SUCCESS}`);
      return GeneralResponse(
        HttpStatus.CREATED,
        ResponseData.SUCCESS,
        `Cart ${Messages.ADD_SUCCESS}`,
      );
    }

    const findCartItem = await this.cartItemModel.findOne({
      where: { product_variant_id },
    });

    if (findCartItem) {
      await this.cartItemModel.update(
        { quantity },
        { where: { product_variant_id } },
      );
    } else {
      const cartData: any = await this.cartModel.findOne({
        where: { user_id },
      });

      const createData: any = {
        cart_id: cartData?.dataValues.id,
        product_id,
        product_variant_id,
        quantity: quantity,
      };

      await this.cartItemModel.create({ ...createData });
    }

    await this.checkCart(findCart?.dataValues.id);

    Logger.log(`Cart ${Messages.ADD_SUCCESS}`);
    return GeneralResponse(
      HttpStatus.CREATED,
      ResponseData.SUCCESS,
      `Cart ${Messages.ADD_SUCCESS}`,
    );
  }

  async viewCart(req: any) {
    const user_id = req.user.id;

    const cartData = await this.cartModel.findOne({
      where: { user_id },
      attributes: [
        'id',
        'user_id',
        'total_quantity',
        'sub_total',
        'total_price',
      ],
      include: [
        {
          model: this.cartItemModel,
          required: false,
          as: 'cart_items',
          attributes: [
            'id',
            'product_id',
            'product_variant_id',
            'cart_id',
            'quantity',
            'price_total',
          ],
          include: [
            {
              model: this.productVariantModel,
              required: false,
              as: 'productVariant',
              attributes: [
                'product_title_name',
                'product_id',
                'description',
                'color',
                'size',
                'price',
              ],
              include: [
                {
                  model: ProductImageModel,
                  attributes: ['id', 'image_path'],
                  required: false,
                },
              ],
            },
            {
              model: this.productModel,
              as: 'productData',
              attributes: ['name'],
            },
          ],
        },
      ],
    });

    if (!cartData) {
      Logger.error(`Cart ${Messages.NOT_FOUND}`);
      return GeneralResponse(
        HttpStatus.NOT_FOUND,
        ResponseData.ERROR,
        `Cart ${Messages.NOT_FOUND}`,
        null,
      );
    }

    Logger.log(`Cart ${Messages.GETTING_SUCCESS}`);
    return GeneralResponse(
      HttpStatus.OK,
      ResponseData.SUCCESS,
      undefined,
      cartData.dataValues,
    );
  }

  async deleteCart(id: number) {
    const cartItem = await this.cartItemModel.findOne({ where: { id } });

    if (!cartItem) {
      Logger.error(`Cart item ${Messages.NOT_FOUND}`);
      return GeneralResponse(
        HttpStatus.NOT_FOUND,
        ResponseData.ERROR,
        `Cart item ${Messages.NOT_FOUND}`,
      );
    }

    await this.cartItemModel.destroy({ where: { id } });
    const findItem = await this.cartItemModel.findAll({
      where: {
        cart_id: cartItem.dataValues.cart_id,
      },
    });

    if (findItem.length === 0) {
      await this.cartModel.destroy({
        where: { id: cartItem.dataValues.cart_id },
      });
    } else {
      await this.checkCart(cartItem.dataValues.cart_id);
    }

    Logger.log(`Cart ${Messages.DELETE_SUCCESS}`);
    return GeneralResponse(
      HttpStatus.OK,
      ResponseData.SUCCESS,
      `Cart ${Messages.DELETE_SUCCESS}`,
    );
  }
}

import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { pagination, sorting } from 'src/libs/services/commonFunction';
import { GeneralResponse } from 'src/libs/services/generalResponse';
import { Messages } from 'src/libs/utility/constants/message';
import { ResponseData } from 'src/libs/utility/constants/response';
import { CartItemModel } from 'src/models/cart-item.model';
import { CartModel } from 'src/models/cart.model';
import { OrderItemModel } from 'src/models/order-item.model';
import { OrderModel } from 'src/models/order.model';
import { PaymentModel } from 'src/models/payment.model';
import { ProductImageModel } from 'src/models/product-image.model';
import { ProductVariantModel } from 'src/models/product-variant.model';
import { ProductModel } from 'src/models/product.model';
import { PaymentService } from 'src/payment/payment.service';
import { AddAddressDto } from './dto/add-address.dto';
import { UserModel } from 'src/models/user.model';
import { CityModel } from 'src/models/city.model';
import { StateModel } from 'src/models/state.model';
import { CountryModel } from 'src/models/country.model';
import { OrderDto } from './dto/order.dto';
import { AddressModel } from 'src/models/address.model';
import { UpdateAddressDto } from './dto/updateAddress.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly paymentService: PaymentService,
    @InjectModel(OrderItemModel)
    private readonly orderItemModel: typeof OrderItemModel,
    @InjectModel(OrderModel) private readonly orderModel: typeof OrderModel,
    @InjectModel(ProductVariantModel)
    private readonly productVariantModel: typeof ProductVariantModel,
    @InjectModel(CartModel)
    private readonly cartModel: typeof CartModel,
    @InjectModel(CartItemModel)
    private readonly cartItemModel: typeof CartItemModel,
    @InjectModel(ProductImageModel)
    private readonly productImageModel: typeof ProductImageModel,
    @InjectModel(PaymentModel)
    private readonly paymentModel: typeof PaymentModel,
    @InjectModel(ProductModel)
    private readonly productModel: typeof ProductModel,
    @InjectModel(AddressModel)
    private readonly addressModel: typeof AddressModel,
    @InjectModel(UserModel)
    private readonly userModel: typeof UserModel,
    @InjectModel(CityModel)
    private readonly cityModel: typeof CityModel,
    @InjectModel(StateModel)
    private readonly stateModel: typeof StateModel,
    @InjectModel(CountryModel)
    private readonly countryModel: typeof CountryModel,
    private readonly userService: UserService,
  ) {}

  async createOrder(dto: OrderDto, req: any) {
    const {
      payment_mode,
      cart_id,
      paymentMethod,
      shipping_address_id,
      billing_address_id,
      billingSameAsShipping,
    } = dto;
    const user_id = req.user.id;

    const findCartData: any = await this.cartModel.findOne({
      where: { id: cart_id, user_id },
      include: [
        {
          model: this.cartItemModel,
        },
      ],
    });

    if (!findCartData) {
      Logger.log(`Cart ${Messages.NOT_FOUND}`);
      return GeneralResponse(
        HttpStatus.NOT_FOUND,
        ResponseData.ERROR,
        `Cart ${Messages.NOT_FOUND}`,
      );
    }

    const { total_quantity, sub_total, total_price, cart_items } =
      findCartData?.dataValues;

    for (const item of cart_items) {
      const findProductVariant: any = await this.productVariantModel.findOne({
        where: { id: item.dataValues.product_variant_id },
      });

      if (findProductVariant?.dataValues.quantity < item.dataValues.quantity) {
        Logger.error(
          `Product ${findProductVariant.dataValues.product_title_name} is ${Messages.OUT_OF_STOCK}`,
        );

        return GeneralResponse(
          HttpStatus.BAD_REQUEST,
          ResponseData.ERROR,
          `Product ${findProductVariant.dataValues.product_title_name} is ${Messages.OUT_OF_STOCK}`,
        );
      }
    }

    const orderPayload: any = {
      user_id,
      total_quantity,
      sub_total,
      total_price,
      payment_mode,
      shipping_address_id,
      billingSameAsShipping,
      billing_address_id: billingSameAsShipping
        ? shipping_address_id
        : billing_address_id,
    };

    const paymentPayload = {
      amount: orderPayload.total_price,
      currency: 'usd',
      paymentMethod,
    };

    const paymentIntent: any =
      await this.paymentService.createPaymentIntent(paymentPayload);

    const verifyPayment = await this.paymentService.verifyPayment({
      payment_id: paymentIntent.payment_id,
    });

    if (verifyPayment.data.status === 'succeeded') {
      const addOrderData: any = await this.orderModel.create({
        status: 'confirm',
        ...orderPayload,
      });

      const order_id = addOrderData.dataValues.id;
      const order_name: any = 'Order' + order_id;

      await this.orderModel.update({ order_name }, { where: { id: order_id } });

      const successPaymentPayload: any = {
        order_id,
        payment_id: paymentIntent.payment_id,
        status: verifyPayment.data.status,
        total_payment: verifyPayment.data.amount,
      };

      await this.paymentModel.create(successPaymentPayload);

      for (const item of cart_items) {
        const orderItemPayload: any = {
          order_id,
          product_id: item.dataValues.product_id,
          product_variant_id: item.dataValues.product_variant_id,
          quantity: item.dataValues.quantity,
          price_total: item.dataValues.price_total,
        };

        await this.orderItemModel.create(orderItemPayload);
        await this.cartItemModel.destroy({ where: { id: item.dataValues.id } });
      }

      await this.cartModel.destroy({ where: { id: cart_id } });

      for (const item of cart_items) {
        const findProductVariant: any = await this.productVariantModel.findOne({
          where: { id: item.dataValues.product_variant_id },
        });

        const quantity =
          findProductVariant?.dataValues.quantity - item.dataValues.quantity;

        await this.productVariantModel.update(
          { quantity },
          { where: { id: item.dataValues.product_variant_id } },
        );
      }

      Logger.log(`${Messages.ORDER_SUCCESS}`);
      return GeneralResponse(
        HttpStatus.OK,
        ResponseData.SUCCESS,
        `${Messages.ORDER_SUCCESS}`,
        { payment_id: paymentIntent.payment_id },
      );
    }
  }

  async ListOfOrders(dto: any) {
    const { search, pageSize, page, sortValue, sortKey } = dto;
    const sortQuery = sorting(sortKey, sortValue);

    const whereCondition: any = {
      attributes: [
        'id',
        'user_id',
        'billingSameAsShipping',
        'total_quantity',
        'sub_total',
        'total_price',
        'status',
        'order_name',
        'payment_mode',
        'createdAt',
      ],
      include: [
        {
          model: this.orderItemModel,
          as: 'orderItems',
          attributes: [
            'id',
            'product_id',
            'product_variant_id',
            'order_id',
            'quantity',
          ],
          include: [
            {
              model: this.productVariantModel,
              as: 'product_variant',
              attributes: [
                'id',
                'product_title_name',
                'product_id',
                'description',
                'color',
                'size',
                'price',
              ],
              include: [
                {
                  model: this.productImageModel,
                  as: 'image',
                  attributes: ['image_path'],
                },
              ],
            },
          ],
        },
        {
          model: this.addressModel,
          as: 'shippingAddress',
          attributes: [
            'id',
            'name',
            'phone_number',
            'address_line1',
            'address_line2',
            'postal_code',
          ],
          include: [
            { model: this.cityModel, attributes: ['city_name'] },
            { model: this.stateModel, attributes: ['state_name'] },
            { model: this.countryModel, attributes: ['country_name'] },
          ],
        },
        {
          model: this.addressModel,
          as: 'billingAddress',
          attributes: [
            'id',
            'name',
            'phone_number',
            'address_line1',
            'address_line2',
            'postal_code',
          ],
          include: [
            { model: this.cityModel, attributes: ['city_name'] },
            { model: this.stateModel, attributes: ['state_name'] },
            { model: this.countryModel, attributes: ['country_name'] },
          ],
        },
      ],
      order: sortQuery,
    };

    if (search) {
      whereCondition.include[0].include[0].where = {
        [Op.or]: [
          { product_title_name: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } },
          { color: { [Op.like]: `%${search}%` } },
        ],
      };
    }

    const paginationResult = await pagination(
      this.orderModel,
      page,
      pageSize,
      whereCondition,
      'orders',
    );

    Logger.log(`Orders ${Messages.GETTING_SUCCESS}`);
    return GeneralResponse(
      HttpStatus.OK,
      ResponseData.SUCCESS,
      undefined,
      paginationResult,
    );
  }

  async viewOrder(order_id: number, req: any) {
    const user_id = req.user.id;

    const orderViewData = await this.orderModel.findOne({
      where: { id: order_id, user_id },
      attributes: [
        'id',
        'user_id',
        'billingSameAsShipping',
        'total_quantity',
        'sub_total',
        'total_price',
        'status',
        'order_name',
        'payment_mode',
        'createdAt',
      ],
      include: [
        {
          model: this.orderItemModel,
          attributes: [
            'id',
            'product_id',
            'product_variant_id',
            'order_id',
            'quantity',
            'price_total',
            'createdAt',
          ],
          include: [
            {
              model: this.productVariantModel,
              attributes: [
                'id',
                'product_title_name',
                'product_id',
                'description',
                'color',
                'size',
                'price',
              ],
              include: [
                {
                  model: this.productImageModel,
                  as: 'image',
                  attributes: ['image_path'],
                },
              ],
            },
          ],
        },
        {
          model: this.addressModel,
          as: 'shippingAddress',
          attributes: [
            'id',
            'name',
            'phone_number',
            'address_line1',
            'address_line2',
            'postal_code',
          ],
          include: [
            { model: this.cityModel, attributes: ['city_name'] },
            { model: this.stateModel, attributes: ['state_name'] },
            { model: this.countryModel, attributes: ['country_name'] },
          ],
        },
        {
          model: this.addressModel,
          as: 'billingAddress',
          attributes: [
            'id',
            'name',
            'phone_number',
            'address_line1',
            'address_line2',
            'postal_code',
          ],
          include: [
            { model: this.cityModel, attributes: ['city_name'] },
            { model: this.stateModel, attributes: ['state_name'] },
            { model: this.countryModel, attributes: ['country_name'] },
          ],
        },
      ],
    });

    if (!orderViewData) {
      Logger.error(`Order ${Messages.NOT_FOUND}`);
      return GeneralResponse(
        HttpStatus.NOT_FOUND,
        ResponseData.ERROR,
        `Order ${Messages.NOT_FOUND}`,
      );
    }

    Logger.log(`Order ${Messages.GETTING_SUCCESS}`);
    return GeneralResponse(
      HttpStatus.OK,
      ResponseData.SUCCESS,
      undefined,
      orderViewData,
    );
  }

  async cancelOrder(order_id: number, req: any) {
    const user_id = req.user.id;

    const findOrderData: any = await this.orderModel.findOne({
      where: { id: order_id, user_id },
      attributes: [
        'id',
        'user_id',
        'total_quantity',
        'sub_total',
        'total_price',
        'status',
      ],
      include: [
        {
          model: this.orderItemModel,
          attributes: [
            'id',
            'product_id',
            'product_variant_id',
            'order_id',
            'quantity',
            'price_total',
          ],
        },
      ],
    });

    if (!findOrderData) {
      Logger.error(`Order ${Messages.NOT_FOUND}`);
      return GeneralResponse(
        HttpStatus.NOT_FOUND,
        ResponseData.ERROR,
        `Order ${Messages.NOT_FOUND}`,
      );
    }

    if (findOrderData.dataValues.status === 'cancel') {
      Logger.error(`This order ${Messages.ALREADY_CANCEL}`);
      return GeneralResponse(
        HttpStatus.NOT_FOUND,
        ResponseData.ERROR,
        `This order ${Messages.ALREADY_CANCEL}`,
      );
    }

    const paymentData: any = await this.paymentModel.findOne({
      where: { order_id, status: 'succeeded' },
    });

    if (!paymentData) {
      Logger.error(`${Messages.ALREADY_REFUNDED}`);
      return GeneralResponse(
        HttpStatus.BAD_REQUEST,
        ResponseData.ERROR,
        `${Messages.ALREADY_REFUNDED}`,
      );
    }

    const { orderItems } = findOrderData.dataValues;
    await this.orderModel.update(
      { status: 'cancel' },
      { where: { id: order_id } },
    );

    await this.paymentService.refundPayment({
      payment_id: paymentData.dataValues.payment_id,
      amount: paymentData.dataValues.total_payment,
    });

    await this.paymentModel.update(
      { status: 'refunded' },
      { where: { order_id } },
    );

    for (const item of orderItems) {
      const findProductVariant: any = await this.productVariantModel.findOne({
        where: { id: item.dataValues.product_variant_id },
      });

      const quantity =
        findProductVariant?.dataValues.quantity + item.dataValues.quantity;

      await this.productVariantModel.update(
        { quantity },
        { where: { id: item.dataValues.product_variant_id } },
      );
    }

    Logger.error(`Order ${Messages.CANCEL_SUCCESS}`);
    return GeneralResponse(
      HttpStatus.ACCEPTED,
      ResponseData.SUCCESS,
      `Order ${Messages.CANCEL_SUCCESS}`,
    );
  }

  async ListOfOrderUser(dto: any, req: any) {
    const user_id = req.user.id;

    const { search, pageSize, page, sortValue, sortKey } = dto;
    const sortQuery = sorting(sortKey, sortValue);

    const whereCondition: any = {
      attributes: [
        'id',
        'user_id',
        'billingSameAsShipping',
        'total_quantity',
        'sub_total',
        'total_price',
        'status',
        'order_name',
        'payment_mode',
        'createdAt',
      ],
      include: [
        {
          model: this.orderItemModel,
          as: 'orderItems',
          attributes: [
            'id',
            'product_id',
            'product_variant_id',
            'order_id',
            'quantity',
          ],
          include: [
            {
              model: this.productVariantModel,
              as: 'product_variant',
              attributes: [
                'id',
                'product_title_name',
                'product_id',
                'description',
                'color',
                'size',
                'price',
              ],
              include: [
                {
                  model: this.productImageModel,
                  as: 'image',
                  attributes: ['image_path'],
                },
              ],
            },
          ],
        },
        {
          model: this.addressModel,
          as: 'shippingAddress',
          attributes: [
            'id',
            'name',
            'phone_number',
            'address_line1',
            'address_line2',
            'postal_code',
          ],
          include: [
            { model: this.cityModel, attributes: ['city_name'] },
            { model: this.stateModel, attributes: ['state_name'] },
            { model: this.countryModel, attributes: ['country_name'] },
          ],
        },
        {
          model: this.addressModel,
          as: 'billingAddress',
          attributes: [
            'id',
            'name',
            'phone_number',
            'address_line1',
            'address_line2',
            'postal_code',
          ],
          include: [
            { model: this.cityModel, attributes: ['city_name'] },
            { model: this.stateModel, attributes: ['state_name'] },
            { model: this.countryModel, attributes: ['country_name'] },
          ],
        },
      ],
      order: sortQuery,
      where: { user_id },
    };

    if (search) {
      whereCondition.include[0].include[0].where = {
        [Op.or]: [
          { product_title_name: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } },
          { color: { [Op.like]: `%${search}%` } },
        ],
      };
    }

    const paginationResult = await pagination(
      this.orderModel,
      page,
      pageSize,
      whereCondition,
      'orders',
    );

    Logger.log(`Orders ${Messages.GETTING_SUCCESS}`);
    return GeneralResponse(
      HttpStatus.OK,
      ResponseData.SUCCESS,
      undefined,
      paginationResult,
    );
  }

  async addAddress(req: any, dto: AddAddressDto) {
    const user_id = req.user.id;

    const { city_id, state_id, country_id, ...otherField } = dto;

    const addressCheck = await this.userService.checkAddress(
      city_id,
      state_id,
      country_id,
    );
    if (addressCheck) {
      return addressCheck;
    }

    const address = await this.addressModel.create({
      user_id,
      city_id,
      state_id,
      country_id,
      ...otherField,
    } as any);

    Logger.log(`Address ${Messages.ADD_SUCCESS}`);
    return GeneralResponse(
      HttpStatus.CREATED,
      ResponseData.SUCCESS,
      `Address ${Messages.ADD_SUCCESS}`,
      { id: address.dataValues.id },
    );
  }

  async listOfAddress(req: any) {
    const user_id = req.user.id;

    const addresses = await this.addressModel.findAll({
      where: { user_id },
      include: [
        { model: CityModel, attributes: ['city_name'] },
        { model: StateModel, attributes: ['state_name'] },
        { model: CountryModel, attributes: ['country_name'] },
      ],
    });

    if (addresses.length === 0) {
      Logger.error(`Addresses ${Messages.NOT_FOUND}`);
      return GeneralResponse(
        HttpStatus.NOT_FOUND,
        ResponseData.ERROR,
        `Addresses ${Messages.NOT_FOUND}`,
      );
    }

    Logger.log(`Addresses ${Messages.GETTING_SUCCESS}`);
    return GeneralResponse(
      HttpStatus.OK,
      ResponseData.SUCCESS,
      `Addresses ${Messages.GETTING_SUCCESS}`,
      addresses,
    );
  }

  async viewAddress(req: any, address_id: number) {
    const user_id = req.user.id;

    const address = await this.addressModel.findOne({
      where: { user_id, id: address_id },
      include: [
        { model: CityModel, attributes: ['city_name'] },
        { model: StateModel, attributes: ['state_name'] },
        { model: CountryModel, attributes: ['country_name'] },
      ],
    });

    if (!address) {
      Logger.error(`Addresses ${Messages.NOT_FOUND}`);
      return GeneralResponse(
        HttpStatus.NOT_FOUND,
        ResponseData.ERROR,
        `Addresses ${Messages.NOT_FOUND}`,
      );
    }

    return GeneralResponse(
      HttpStatus.OK,
      ResponseData.SUCCESS,
      `Addresses ${Messages.GETTING_SUCCESS}`,
      address,
    );
  }

  async updateAddress(address_id: number, dto: UpdateAddressDto, req: any) {
    const user_id = req.user.id;

    const findAddress = await this.addressModel.findOne({
      where: { id: address_id, home_address: 0, user_id },
    });

    if (!findAddress) {
      Logger.error(`Address ${Messages.NOT_FOUND}`);
      return GeneralResponse(
        HttpStatus.NOT_FOUND,
        ResponseData.ERROR,
        `Address ${Messages.NOT_FOUND}`,
      );
    }

    if (dto.city_id || dto.state_id || dto.country_id) {
      const addressCheck = await this.userService.checkAddress(
        dto.city_id,
        dto.state_id,
        dto.country_id,
      );

      if (addressCheck) {
        return addressCheck;
      }
    }

    await this.addressModel.update(
      {
        ...dto,
      },
      { where: { id: address_id, home_address: 0, user_id } },
    );

    Logger.log(`Address ${Messages.UPDATE_SUCCESS}`);
    return GeneralResponse(
      HttpStatus.OK,
      ResponseData.SUCCESS,
      `Address ${Messages.UPDATE_SUCCESS}`,
    );
  }

  async deleteAddress(address_id: number, req: any) {
    const user_id = req.user.id;

    const address = await this.addressModel.findOne({
      where: { id: address_id, user_id, home_address: 0 },
    });

    if (!address) {
      Logger.error(`Address ${Messages.NOT_FOUND}`);
      return GeneralResponse(
        HttpStatus.NOT_FOUND,
        ResponseData.ERROR,
        `Address ${Messages.NOT_FOUND}`,
      );
    }

    await address.destroy();

    Logger.log(`Address ${Messages.DELETE_SUCCESS}`);
    return GeneralResponse(
      HttpStatus.OK,
      ResponseData.SUCCESS,
      `Address ${Messages.DELETE_SUCCESS}`,
    );
  }
}

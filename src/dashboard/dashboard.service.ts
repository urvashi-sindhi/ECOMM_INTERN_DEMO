import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import sequelize from 'sequelize';
import { Op } from 'sequelize';
import { pagination, sorting } from 'src/libs/services/commonFunction';
import { GeneralResponse } from 'src/libs/services/generalResponse';
import { Messages } from 'src/libs/utility/constants/message';
import { ResponseData } from 'src/libs/utility/constants/response';
import { OrderItemModel } from 'src/models/order-item.model';
import { OrderModel } from 'src/models/order.model';
import { ProductModel } from 'src/models/product.model';
import { UserModel } from 'src/models/user.model';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(OrderItemModel)
    private readonly orderItemModel: typeof OrderItemModel,
    @InjectModel(OrderModel) private readonly orderModel: typeof OrderModel,
    @InjectModel(ProductModel)
    private readonly productModel: typeof ProductModel,
    @InjectModel(UserModel)
    private readonly userModel: typeof UserModel,
  ) {}

  async dashboardData() {
    const total_order: any = await this.orderModel.count({
      where: {
        status: {
          [Op.like]: 'confirm%',
        },
      },
    });
    const total_cancel_order: any = await this.orderModel.count({
      where: {
        status: {
          [Op.like]: 'pending%',
        },
      },
    });

    const total_pending_order: any = await this.orderModel.count({
      where: {
        status: {
          [Op.like]: 'cancel%',
        },
      },
    });

    const total_product = await this.productModel.count();
    const total_customer = await this.userModel.count({
      where: { role: { [Op.like]: 'customer' } },
    });

    const statisticData = {
      total_order,
      total_cancel_order,
      total_pending_order,
      total_customer,
      total_product,
    };

    Logger.log(`dashboard statistic ${Messages.GETTING_SUCCESS}`);
    return GeneralResponse(
      HttpStatus.OK,
      ResponseData.SUCCESS,
      undefined,
      statisticData,
    );
  }

  async findBigOrder() {
    const findBigOrder = await this.orderModel.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('total_price')), 'total_price'],
      ],
      include: [
        {
          model: this.userModel,
          attributes: ['id', 'name'],
        },
      ],
      group: ['user.id'],
      order: [[sequelize.fn('SUM', sequelize.col('total_price')), 'DESC']],
      limit: 10,
    });

    Logger.log(`Big purchases ${Messages.GETTING_SUCCESS}`);
    return GeneralResponse(
      HttpStatus.OK,
      ResponseData.SUCCESS,
      undefined,
      findBigOrder,
    );
  }

  async getOrderStatistics(timeFrame: any) {
    const now = new Date();
    let whereCondition = {};

    if (timeFrame.timeFrame === 'week') {
      whereCondition = {
        createdAt: {
          [Op.gte]: new Date(now.setDate(now.getDate() - 7)),
        },
      };
    } else if (timeFrame.timeFrame === 'month') {
      whereCondition = {
        createdAt: {
          [Op.gte]: new Date(now.setMonth(now.getMonth() - 1)),
        },
      };
    } else if (timeFrame.timeFrame === 'year') {
      whereCondition = {
        createdAt: {
          [Op.gte]: new Date(now.setFullYear(now.getFullYear() - 1)),
        },
      };
    }

    const totalOrders = await this.orderModel.count({
      where: whereCondition,
    });

    const pendingOrders = await this.orderModel.count({
      where: {
        ...whereCondition,
        status: 'pending',
      },
    });

    const canceledOrders = await this.orderModel.count({
      where: {
        ...whereCondition,
        status: 'cancel',
      },
    });

    const total = totalOrders;
    const pendingPercentage: any = ((pendingOrders / total) * 100).toFixed(2);
    const canceledPercentage: any = ((canceledOrders / total) * 100).toFixed(2);
    const completedPercentage: any = (
      100 -
      pendingPercentage -
      canceledPercentage
    ).toFixed(2);

    const pieChartData = [
      { label: 'Pending Orders', value: parseFloat(pendingPercentage) },
      { label: 'Canceled Orders', value: parseFloat(canceledPercentage) },
      { label: 'Completed Orders', value: parseFloat(completedPercentage) },
    ];

    Logger.log(
      `Order statistics ${timeFrame.timeFrame} ${Messages.GETTING_SUCCESS}`,
    );
    return GeneralResponse(
      HttpStatus.OK,
      ResponseData.SUCCESS,
      undefined,
      pieChartData,
    );
  }

  async orderReport(dto: any) {
    const { search, pageSize, page, sortValue, sortKey, startDate, endDate } =
      dto;
    const sortQuery = sorting(sortKey, sortValue);

    const whereCondition: any = {
      attributes: ['id', 'user_id', 'total_price', 'Order_name', 'createdAt'],
      include: [
        {
          model: this.userModel,
          attributes: ['id', 'name'],
        },
        {
          model: this.orderItemModel,
          attributes: ['id'],
        },
      ],
      order: sortQuery,
      where: {},
    };

    if (search) {
      const userCondition = {
        '$user.name$': { [Op.like]: `%${search}%` },
      };
      const orderCondition = {
        order_name: { [Op.like]: `%${search}%` },
      };
      whereCondition.where = {
        [Op.or]: [orderCondition, userCondition],
      };
      whereCondition.include[0].required = !!search;
    }

    if (startDate && endDate) {
      whereCondition.where = {
        ...whereCondition.where,
        createdAt: { [Op.between]: [new Date(startDate), new Date(endDate)] },
      };
    }

    const paginationResult = await pagination(
      this.orderModel,
      page,
      pageSize,
      whereCondition,
      'orders',
    );

    const processedOrders = paginationResult.orders.map((order) => ({
      id: order.dataValues.id,
      name: order.dataValues.user?.dataValues?.name || 'Unknown',
      order_amount: order.dataValues.total_price || 0,
      total_items: order.dataValues.orderItems?.length || 0,
      order_name: order.dataValues.Order_name || 'Unknown',
    }));

    if (processedOrders.length === 0) {
      Logger.error(`Order ${Messages.NOT_FOUND}`);
      return GeneralResponse(
        HttpStatus.NOT_FOUND,
        ResponseData.ERROR,
        `Order ${Messages.NOT_FOUND}`,
      );
    }

    Logger.log(`Orders ${Messages.RETRIEVED_SUCCESS}`);
    return GeneralResponse(
      HttpStatus.OK,
      ResponseData.SUCCESS,
      `Orders ${Messages.RETRIEVED_SUCCESS}`,
      {
        orders: processedOrders,
        totalOrders: paginationResult.totalItems,
        totalPage: paginationResult.totalPage,
        currentPage: paginationResult.currentPage,
        pageSize: paginationResult.pageSize,
        numberOfRows: paginationResult.numberOfRows,
      },
    );
  }

  async userReport(dto: any) {
    const { search, pageSize, page, sortValue, sortKey } = dto;
    const sortQuery = sorting(sortKey, sortValue);

    const whereCondition: any = {
      attributes: ['name', 'email', 'phone_number', 'gender'],
      order: sortQuery,
      where: {},
    };
    if (search) {
      whereCondition.where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone_number: { [Op.like]: `%${search}%` } },
      ];
    }

    const paginationResult = await pagination(
      this.userModel,
      page,
      pageSize,
      whereCondition,
      'users',
    );

    if (paginationResult.users.length === 0) {
      Logger.error(`User ${Messages.NOT_FOUND}`);
      return GeneralResponse(
        HttpStatus.NOT_FOUND,
        ResponseData.ERROR,
        `User ${Messages.NOT_FOUND}`,
      );
    }

    Logger.log(`Users ${Messages.RETRIEVED_SUCCESS}`);
    return GeneralResponse(
      HttpStatus.OK,
      ResponseData.SUCCESS,
      `Users ${Messages.RETRIEVED_SUCCESS}`,
      paginationResult,
    );
  }
}

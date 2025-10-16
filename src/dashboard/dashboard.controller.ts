import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/libs/services/auth/jwt.guard';
import { Roles } from 'src/libs/helpers/decorators/roles.decorators';
import { UserRoles } from 'src/libs/utility/constants/enums';
import { RolesGuard } from 'src/libs/services/auth/roles.guard';
import { OrderStatisticsDto } from './dto/dashboard.dto';
import { OrderReportDto, UserReportDto } from './dto/reports.dto';

@ApiTags('Dashboard')
@Controller()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Get('dashboard/dashboard-statistic')
  async dashboardData() {
    return this.dashboardService.dashboardData();
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Get('dashboard/highest-purchase-order')
  async findBigOrder() {
    return this.dashboardService.findBigOrder();
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Post('order/piechart-data')
  async getOrderStatistics(@Body() dto: OrderStatisticsDto) {
    return this.dashboardService.getOrderStatistics(dto);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Post('order/orders-report')
  async orderReport(@Body() dto: OrderReportDto) {
    return this.dashboardService.orderReport(dto);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Post('order/users-report')
  async userReport(@Body() dto: UserReportDto) {
    return this.dashboardService.userReport(dto);
  }
}

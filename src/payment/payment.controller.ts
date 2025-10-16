import { Controller, Post, Body } from '@nestjs/common';
import { PaymentService } from './payment.service';
import {
  CreatePaymentIntentDto,
  VerifyPaymentDto,
} from './dto/createPayment.dto';
import { RefundDto } from './dto/refundPayment.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-payment')
  async createPaymentIntent(@Body() dto: CreatePaymentIntentDto) {
    return this.paymentService.createPaymentIntent(dto);
  }

  @Post('verify-payment')
  async verifyPayment(@Body() dto: VerifyPaymentDto) {
    return this.paymentService.verifyPayment(dto);
  }

  @Post('refund-payment')
  async refundPayment(@Body() dto: RefundDto) {
    return this.paymentService.refundPayment(dto);
  }
}

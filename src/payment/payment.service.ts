import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
import {
  CreatePaymentIntentDto,
  VerifyPaymentDto,
} from './dto/createPayment.dto';
import { GeneralResponse } from 'src/libs/services/generalResponse';
import { ResponseData } from 'src/libs/utility/constants/response';
import { Messages } from 'src/libs/utility/constants/message';
import { RefundDto } from './dto/refundPayment.dto';

dotenv.config();

@Injectable()
export class PaymentService {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  async createPaymentIntent(dto: any) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: dto.amount,
        currency: dto.currency,
        payment_method: dto.paymentMethod,
        confirm: true,
        payment_method_types: ['card'],
      });

      return {
        clientSecret: paymentIntent.client_secret,
        payment_id: paymentIntent.id,
        paymentMethod: paymentIntent.payment_method,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async verifyPayment(dto: VerifyPaymentDto) {
    const paymentIntent = await this.stripe.paymentIntents.retrieve(
      dto.payment_id,
    );

    let response: any = {
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      paymentMethod: paymentIntent.payment_method,
    };

    if (response.status === 'requires_payment_method') {
      Logger.log(`${Messages.PAYMENT_FAILED}`);
      return GeneralResponse(
        HttpStatus.BAD_REQUEST,
        ResponseData.ERROR,
        `${Messages.PAYMENT_FAILED}`,
        response,
      );
    }

    Logger.log(`${Messages.PAYMENT_SUCCESS}`);
    return GeneralResponse(
      HttpStatus.OK,
      ResponseData.SUCCESS,
      `${Messages.PAYMENT_SUCCESS}`,
      response,
    );
  }

  async refundPayment(dto: RefundDto) {
    const { payment_id, amount } = dto;
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: payment_id,
        amount,
      });
      return GeneralResponse(
        HttpStatus.OK,
        ResponseData.SUCCESS,
        `Refund successful.`,
        refund,
      );
    } catch (error) {
      return GeneralResponse(
        HttpStatus.BAD_REQUEST,
        ResponseData.ERROR,
        `Refund failed: ${error.message}`,
      );
    }
  }
}

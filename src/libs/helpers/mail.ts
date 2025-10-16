import { HttpStatus, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
import { GeneralResponse } from '../services/generalResponse';
import { ResponseData } from '../utility/constants/response';
import { randomInt } from 'crypto';
dotenv.config();

const transporter: any = nodemailer.createTransport({
  service: 'gmail',
  port: 587,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOtp = () => {
  return randomInt(100000, 999999);
};

export const emailSend = async (obj: any) => {
  const { email, otp } = obj;
  let mailDetail: any = null;

  if (email && otp) {
    mailDetail = {
      to: email,
      subject: 'Your OTP',
      html: `
      <p>Your OTP is:</p>
      <h1><strong>${otp}</strong></h1>
    <p>Please do not share it with anyone.</p>
    <p>OTP will expire in 5 minutes.</p>
      `,
    };
  }

  try {
    const info = await transporter.sendMail(mailDetail);
    Logger.log('Email sent: ' + info.response);
    return GeneralResponse(
      HttpStatus.OK,
      ResponseData.SUCCESS,
      'Email sent: ' + info.response,
    );
  } catch (error) {
    Logger.error('Email sending failed: ' + error.message);
    throw new Error('Email sending failed');
  }
};

module.exports = { emailSend, sendOtp };

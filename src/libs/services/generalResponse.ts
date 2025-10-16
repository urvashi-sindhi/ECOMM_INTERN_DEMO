import { HttpStatus } from '@nestjs/common';
import { ResponseData } from '../utility/constants/response';

export function GeneralResponse(
  statusCode: number,
  status: string,
  message?: string,
  data?: any,
  error?: any,
) {
  if (status === ResponseData.SUCCESS) {
    return {
      statusCode: statusCode || HttpStatus.OK,
      status,
      message,
      data,
      error,
    };
  }

  throw {
    statusCode: statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
    status,
    message,
    data,
    error,
  };
}

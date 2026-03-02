import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class ValidationFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    if (status === 400) {
      const exceptionResponse = exception.getResponse();
      const errors = Array.isArray(exceptionResponse['message'])
        ? exceptionResponse['message']
        : [exceptionResponse['message']];

      const formattedErrors = errors.reduce((acc, error) => {
        const [field, message] = error.split(': ');
        return { ...acc, [field]: message };
      }, {});

      response.status(status).json({
        statusCode: status,
        message: 'Validation failed',
        errors: formattedErrors,
      });
    } else {
      response.status(status).json({
        statusCode: status,
        message: exception.message,
      });
    }
  }
}

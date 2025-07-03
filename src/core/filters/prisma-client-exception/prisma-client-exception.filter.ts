import { Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Example: map Prisma error codes to HTTP status and error names
    let status = HttpStatus.BAD_REQUEST;
    let error = 'BadRequest';

    if (exception.code === 'P2002') {
      status = HttpStatus.CONFLICT;
      error = 'Conflict';
    }
    if (exception.code === 'P2025') {
      status = HttpStatus.NOT_FOUND;
      error = 'NotFound';
    }

    response.status(status).json({
      error,
      success: false,
    });
  }
}

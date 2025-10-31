import {
  BadRequestException,
  ValidationError,
  ValidationPipeOptions,
} from '@nestjs/common';

export const validationExceptionFactory: NonNullable<
  ValidationPipeOptions['exceptionFactory']
> = (errors: ValidationError[]) => {
  const formattedErrors: Record<string, string[]> = {};

  const traverse = (err: ValidationError) => {
    if (err.constraints) {
      formattedErrors[err.property] = Object.values(err.constraints);
    }
    if (err.children && err.children.length > 0) {
      err.children.forEach(traverse);
    }
  };

  errors.forEach(traverse);

  return new BadRequestException({
    statusCode: 400,
    error: 'Bad Request',
    message: formattedErrors,
  });
};

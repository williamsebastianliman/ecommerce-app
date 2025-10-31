import { HttpException, HttpStatus } from '@nestjs/common';

type Dict = Record<string, unknown>;
const isObj = (v: unknown): v is Dict => typeof v === 'object' && v !== null;
const num = (o: Dict | undefined, k: string) =>
  o && typeof o[k] === 'number' ? o[k] : undefined;
const str = (o: Dict | undefined, k: string) =>
  o && typeof o[k] === 'string' ? o[k] : undefined;

export function throwRpcAsHttp(error: unknown): never {
  let status = HttpStatus.INTERNAL_SERVER_ERROR;
  let message: string | string[] = 'Internal server error';

  if (isObj(error)) {
    const response = isObj(error.response) ? error.response : undefined;

    const messageObj = isObj(error.message) ? error.message : undefined;

    status =
      num(error, 'status') ??
      num(error, 'statusCode') ??
      num(response, 'statusCode') ??
      num(messageObj, 'statusCode') ??
      (str(error, 'name') === 'UnauthorizedException'
        ? HttpStatus.UNAUTHORIZED
        : str(error, 'name') === 'BadRequestException'
          ? HttpStatus.BAD_REQUEST
          : HttpStatus.INTERNAL_SERVER_ERROR);

    const fromErrorMsg = (() => {
      const m = error.message;
      if (typeof m === 'string') return m;
      if (Array.isArray(m) && m.every((x) => typeof x === 'string')) return m;
      return undefined;
    })();

    const fromResponseMsg = str(response, 'message');
    const fromMessageObjMsg = str(messageObj, 'message');

    message = fromErrorMsg ?? fromResponseMsg ?? fromMessageObjMsg ?? message;
  }

  throw new HttpException(message, status);
}

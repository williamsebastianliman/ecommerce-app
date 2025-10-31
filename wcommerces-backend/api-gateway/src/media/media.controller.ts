import { Controller, Get, Param, Res, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import type { Response } from 'express';
import { AxiosResponse, AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';

@Controller('media')
export class MediaController {
  constructor(private readonly http: HttpService) {}

  @Get(':file')
  async proxy(
    @Param('file') file: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const response: AxiosResponse<NodeJS.ReadableStream> =
        await firstValueFrom(
          this.http.get<NodeJS.ReadableStream>(
            `http://product-service:4000/assets/${encodeURIComponent(file)}`,
            { responseType: 'stream' },
          ),
        );

      const rawHeader: unknown = response.headers['content-type'];

      const contentType: string =
        typeof rawHeader === 'string'
          ? rawHeader
          : Array.isArray(rawHeader) && typeof rawHeader[0] === 'string'
            ? rawHeader[0]
            : 'application/octet-stream';

      res.setHeader('Content-Type', contentType);

      response.data.pipe(res);
    } catch (error: unknown) {
      const isAxiosError = (err: unknown): err is AxiosError => {
        return (err as AxiosError).isAxiosError === true;
      };

      if (isAxiosError(error) && error.response?.status === 404) {
        res.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'File not found',
          error: 'Not Found',
        });
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to retrieve file',
          error: 'Internal Server Error',
        });
      }
    }
  }
}

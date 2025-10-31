import { ImageMetaDTO } from './image-meta.response.dto';

export class ProductInOrderResponseDTO {
  id!: string;
  name!: string;
  description!: string;
  image?: ImageMetaDTO;
}

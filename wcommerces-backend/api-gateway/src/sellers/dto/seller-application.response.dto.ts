export class SellerApplicationDto {
  id!: string;
  email!: string;
  name!: string;
  role!: 'USER' | 'ADMIN' | 'SELLER';
}

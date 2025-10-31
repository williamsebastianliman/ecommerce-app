export class UserResponseDto {
  id!: string;
  email!: string;
  name!: string;
  role!: 'USER' | 'ADMIN' | 'SELLER';
  address!: string;
  createdAt!: string;
  updatedAt!: string;
}

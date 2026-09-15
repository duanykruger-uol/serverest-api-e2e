import { faker } from '@faker-js/faker';

export interface ProductPayload {
  nome: string;
  preco: number;
  descricao: string;
  quantidade: number;
}

export function buildProduct(overrides: Partial<ProductPayload> = {}): ProductPayload {
  return {
    nome: faker.commerce.productName() + ' ' + faker.string.uuid().slice(0, 8),
    preco: faker.number.int({ min: 10, max: 5000 }),
    descricao: faker.commerce.productDescription(),
    quantidade: faker.number.int({ min: 1, max: 50 }),
    ...overrides,
  };
}

import { faker } from '@faker-js/faker';

export interface UserPayload {
  nome: string;
  email: string;
  password: string;
  administrador: 'true' | 'false';
}

export function buildUser(overrides: Partial<UserPayload> = {}): UserPayload {
  return {
    nome: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    password: faker.internet.password({ length: 10 }),
    administrador: 'false',
    ...overrides,
  };
}

export function buildAdminUser(overrides: Partial<UserPayload> = {}): UserPayload {
  return buildUser({ administrador: 'true', ...overrides });
}

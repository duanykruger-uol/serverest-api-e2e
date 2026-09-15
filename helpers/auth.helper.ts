import request from 'supertest';
import { BASE_URL } from '../config';

export async function login(email: string, password: string) {
  return request(BASE_URL).post('/login').send({ email, password });
}

export async function authAsAdmin(): Promise<string> {
  const { buildAdminUser } = await import('../fixtures/user.fixtures');
  const admin = buildAdminUser();
  await request(BASE_URL).post('/usuarios').send(admin);
  const res = await login(admin.email, admin.password);
  return res.body.authorization;
}

export async function authAsUser(): Promise<string> {
  const { buildUser } = await import('../fixtures/user.fixtures');
  const user = buildUser();
  await request(BASE_URL).post('/usuarios').send(user);
  const res = await login(user.email, user.password);
  return res.body.authorization;
}

import request from 'supertest';
import { BASE_URL } from '../config';
import { buildProduct, ProductPayload } from '../fixtures/product.fixtures';

export async function createProduct(adminToken: string, overrides: Partial<ProductPayload> = {}) {
  const product = buildProduct(overrides);
  const res = await request(BASE_URL).post('/produtos').set('Authorization', adminToken).send(product);
  return { product, id: res.body._id as string };
}

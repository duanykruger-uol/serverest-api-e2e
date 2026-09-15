import request from 'supertest';
import { BASE_URL } from '../config';

interface CartProduct {
  idProduto: string;
  quantidade: number;
}

export async function createCart(userToken: string, produtos: CartProduct[]) {
  return request(BASE_URL).post('/carrinhos').set('Authorization', userToken).send({ produtos });
}

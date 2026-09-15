import request from 'supertest';
import { BASE_URL } from '../../config';
import { authAsAdmin, authAsUser } from '../../helpers/auth.helper';
import { createProduct } from '../../helpers/product.helper';
import { createCart } from '../../helpers/cart.helper';

describe('/carrinhos', () => {
  describe('POST /carrinhos', () => {
    it('deve criar um carrinho com produtos válidos e reduzir o estoque (cenário positivo)', async () => {
      const adminToken = await authAsAdmin();
      const { id: productId } = await createProduct(adminToken, { quantidade: 10 });
      const userToken = await authAsUser();

      const res = await createCart(userToken, [{ idProduto: productId, quantidade: 3 }]);

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Cadastro realizado com sucesso');

      const produto = await request(BASE_URL).get(`/produtos/${productId}`);
      expect(produto.body.quantidade).toBe(7);

      await request(BASE_URL).delete('/carrinhos/cancelar-compra').set('Authorization', userToken);
    });

    it('deve retornar 401 ao criar carrinho sem token de autenticação (cenário negativo)', async () => {
      const res = await request(BASE_URL).post('/carrinhos').send({ produtos: [] });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe(
        'Token de acesso ausente, inválido, expirado ou usuário do token não existe mais'
      );
    });

    it('deve retornar 400 ao criar carrinho com produto inexistente (cenário negativo)', async () => {
      const userToken = await authAsUser();

      const res = await createCart(userToken, [{ idProduto: 'idInexistente123', quantidade: 1 }]);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Produto não encontrado');
    });

    it('deve retornar 400 ao criar carrinho com produto duplicado na lista (cenário negativo)', async () => {
      const adminToken = await authAsAdmin();
      const { id: productId } = await createProduct(adminToken, { quantidade: 10 });
      const userToken = await authAsUser();

      const res = await createCart(userToken, [
        { idProduto: productId, quantidade: 1 },
        { idProduto: productId, quantidade: 1 },
      ]);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Não é permitido possuir produto duplicado');
    });

    it('deve retornar 400 ao criar um segundo carrinho para o mesmo usuário (cenário negativo)', async () => {
      const adminToken = await authAsAdmin();
      const { id: productId } = await createProduct(adminToken, { quantidade: 10 });
      const userToken = await authAsUser();

      await createCart(userToken, [{ idProduto: productId, quantidade: 1 }]);
      const res = await createCart(userToken, [{ idProduto: productId, quantidade: 1 }]);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Não é permitido ter mais de 1 carrinho');

      await request(BASE_URL).delete('/carrinhos/cancelar-compra').set('Authorization', userToken);
    });

    it('deve retornar 400 ao solicitar quantidade maior que o estoque disponível (cenário negativo)', async () => {
      const adminToken = await authAsAdmin();
      const { id: productId } = await createProduct(adminToken, { quantidade: 5 });
      const userToken = await authAsUser();

      const res = await createCart(userToken, [{ idProduto: productId, quantidade: 10 }]);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Produto não possui quantidade suficiente');
    });
  });

  describe('GET /carrinhos', () => {
    it('deve listar os carrinhos cadastrados (cenário positivo)', async () => {
      const res = await request(BASE_URL).get('/carrinhos');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('quantidade');
      expect(Array.isArray(res.body.carrinhos)).toBe(true);
    });
  });

  describe('GET /carrinhos/{_id}', () => {
    it('deve retornar 400 ao buscar carrinho com ID inexistente (cenário negativo)', async () => {
      // a API exige 16 caracteres alfanuméricos no formato do ID; caso contrário retorna outra mensagem de validação
      const res = await request(BASE_URL).get('/carrinhos/idInexistente123');

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Carrinho não encontrado');
    });
  });

  describe('DELETE /carrinhos/concluir-compra', () => {
    it('deve concluir a compra removendo o carrinho do usuário (cenário positivo)', async () => {
      const adminToken = await authAsAdmin();
      const { id: productId } = await createProduct(adminToken, { quantidade: 10 });
      const userToken = await authAsUser();
      await createCart(userToken, [{ idProduto: productId, quantidade: 1 }]);

      const res = await request(BASE_URL).delete('/carrinhos/concluir-compra').set('Authorization', userToken);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Registro excluído com sucesso');
    });

    it('deve retornar 200 e mensagem específica ao concluir compra sem carrinho cadastrado (edge case)', async () => {
      const userToken = await authAsUser();

      const res = await request(BASE_URL).delete('/carrinhos/concluir-compra').set('Authorization', userToken);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Não foi encontrado carrinho para esse usuário');
    });

    it('deve retornar 401 ao concluir compra sem token de autenticação (cenário negativo)', async () => {
      const res = await request(BASE_URL).delete('/carrinhos/concluir-compra');

      expect(res.status).toBe(401);
      expect(res.body.message).toBe(
        'Token de acesso ausente, inválido, expirado ou usuário do token não existe mais'
      );
    });
  });

  describe('DELETE /carrinhos/cancelar-compra', () => {
    it('deve cancelar a compra e devolver os produtos ao estoque (cenário positivo)', async () => {
      const adminToken = await authAsAdmin();
      const { id: productId } = await createProduct(adminToken, { quantidade: 10 });
      const userToken = await authAsUser();
      await createCart(userToken, [{ idProduto: productId, quantidade: 4 }]);

      const res = await request(BASE_URL).delete('/carrinhos/cancelar-compra').set('Authorization', userToken);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Registro excluído com sucesso. Estoque dos produtos reabastecido');

      const produto = await request(BASE_URL).get(`/produtos/${productId}`);
      expect(produto.body.quantidade).toBe(10);
    });

    it('deve retornar 401 ao cancelar compra sem token de autenticação (cenário negativo)', async () => {
      const res = await request(BASE_URL).delete('/carrinhos/cancelar-compra');

      expect(res.status).toBe(401);
      expect(res.body.message).toBe(
        'Token de acesso ausente, inválido, expirado ou usuário do token não existe mais'
      );
    });
  });
});

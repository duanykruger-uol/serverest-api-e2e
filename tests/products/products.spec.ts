import request from 'supertest';
import { BASE_URL } from '../../config';
import { buildProduct } from '../../fixtures/product.fixtures';
import { authAsAdmin, authAsUser } from '../../helpers/auth.helper';
import { createProduct } from '../../helpers/product.helper';
import { createCart } from '../../helpers/cart.helper';

describe('/produtos', () => {
  describe('POST /produtos', () => {
    it('deve cadastrar um produto com token de administrador (cenário positivo)', async () => {
      const adminToken = await authAsAdmin();
      const product = buildProduct();

      const res = await request(BASE_URL).post('/produtos').set('Authorization', adminToken).send(product);

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Cadastro realizado com sucesso');
      expect(res.body._id).toBeDefined();
    });

    it('deve retornar 401 ao cadastrar produto sem token de autenticação (cenário negativo)', async () => {
      const product = buildProduct();

      const res = await request(BASE_URL).post('/produtos').send(product);

      expect(res.status).toBe(401);
      expect(res.body.message).toBe(
        'Token de acesso ausente, inválido, expirado ou usuário do token não existe mais'
      );
    });

    it('deve retornar 403 ao cadastrar produto com token de usuário não administrador (cenário negativo)', async () => {
      const userToken = await authAsUser();
      const product = buildProduct();

      const res = await request(BASE_URL).post('/produtos').set('Authorization', userToken).send(product);

      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Rota exclusiva para administradores');
    });

    it('deve retornar 400 ao cadastrar produto com nome já existente (cenário negativo)', async () => {
      const adminToken = await authAsAdmin();
      const product = buildProduct();
      await request(BASE_URL).post('/produtos').set('Authorization', adminToken).send(product);

      const res = await request(BASE_URL).post('/produtos').set('Authorization', adminToken).send(product);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Já existe produto com esse nome');
    });
  });

  describe('GET /produtos', () => {
    it('deve listar os produtos cadastrados (cenário positivo)', async () => {
      const res = await request(BASE_URL).get('/produtos');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('quantidade');
      expect(Array.isArray(res.body.produtos)).toBe(true);
    });
  });

  describe('GET /produtos/{_id}', () => {
    it('deve buscar um produto por ID existente (cenário positivo)', async () => {
      const adminToken = await authAsAdmin();
      const { id, product } = await createProduct(adminToken);

      const res = await request(BASE_URL).get(`/produtos/${id}`);

      expect(res.status).toBe(200);
      expect(res.body._id).toBe(id);
      expect(res.body.nome).toBe(product.nome);
    });

    it('deve retornar 400 ao buscar produto com ID inexistente (cenário negativo)', async () => {
      // a API exige 16 caracteres alfanuméricos no formato do ID; caso contrário retorna outra mensagem de validação
      const res = await request(BASE_URL).get('/produtos/idInexistente123');

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Produto não encontrado');
    });
  });

  describe('PUT /produtos/{_id}', () => {
    it('deve editar um produto existente com token de administrador (cenário positivo)', async () => {
      const adminToken = await authAsAdmin();
      const { id, product } = await createProduct(adminToken, { quantidade: 10 });

      const res = await request(BASE_URL)
        .put(`/produtos/${id}`)
        .set('Authorization', adminToken)
        .send({ ...product, quantidade: 15 });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Registro alterado com sucesso');
    });
  });

  describe('DELETE /produtos/{_id}', () => {
    it('deve excluir um produto sem vínculo com carrinho, usando token de administrador (cenário positivo)', async () => {
      const adminToken = await authAsAdmin();
      const { id } = await createProduct(adminToken);

      const res = await request(BASE_URL).delete(`/produtos/${id}`).set('Authorization', adminToken);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Registro excluído com sucesso');
    });

    it('não deve excluir um produto vinculado a um carrinho (cenário negativo)', async () => {
      const adminToken = await authAsAdmin();
      const { id: productId } = await createProduct(adminToken);

      const userToken = await authAsUser();
      await createCart(userToken, [{ idProduto: productId, quantidade: 1 }]);

      const res = await request(BASE_URL).delete(`/produtos/${productId}`).set('Authorization', adminToken);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Não é permitido excluir produto que faz parte de carrinho');
      expect(res.body.idCarrinhos).toBeDefined();

      // limpeza: cancela a compra para liberar o estoque do produto
      await request(BASE_URL).delete('/carrinhos/cancelar-compra').set('Authorization', userToken);
    });

    it('deve retornar 401 ao excluir produto sem token de autenticação (cenário negativo)', async () => {
      const adminToken = await authAsAdmin();
      const { id } = await createProduct(adminToken);

      const res = await request(BASE_URL).delete(`/produtos/${id}`);

      expect(res.status).toBe(401);
      expect(res.body.message).toBe(
        'Token de acesso ausente, inválido, expirado ou usuário do token não existe mais'
      );
    });

    it('deve retornar 403 ao excluir produto com token de usuário não administrador (cenário negativo)', async () => {
      const adminToken = await authAsAdmin();
      const { id } = await createProduct(adminToken);
      const userToken = await authAsUser();

      const res = await request(BASE_URL).delete(`/produtos/${id}`).set('Authorization', userToken);

      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Rota exclusiva para administradores');
    });

    it('deve retornar 200 e "Nenhum registro excluído" ao excluir produto com ID inexistente (edge case)', async () => {
      const adminToken = await authAsAdmin();

      const res = await request(BASE_URL).delete('/produtos/idInexistente123').set('Authorization', adminToken);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Nenhum registro excluído');
    });
  });
});

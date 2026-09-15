import request from 'supertest';
import { BASE_URL } from '../../config';
import { buildUser } from '../../fixtures/user.fixtures';
import { login, authAsAdmin } from '../../helpers/auth.helper';
import { createProduct } from '../../helpers/product.helper';
import { createCart } from '../../helpers/cart.helper';

describe('/usuarios', () => {
  describe('POST /usuarios', () => {
    it('deve cadastrar um usuário com dados válidos (cenário positivo)', async () => {
      const user = buildUser();

      const res = await request(BASE_URL).post('/usuarios').send(user);

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Cadastro realizado com sucesso');
      expect(res.body._id).toBeDefined();
    });

    it('deve retornar 400 ao cadastrar usuário com email já existente (cenário negativo)', async () => {
      const user = buildUser();
      await request(BASE_URL).post('/usuarios').send(user);

      const res = await request(BASE_URL).post('/usuarios').send(user);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Este email já está sendo usado');
    });
  });

  describe('GET /usuarios', () => {
    it('deve listar os usuários cadastrados (cenário positivo)', async () => {
      const res = await request(BASE_URL).get('/usuarios');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('quantidade');
      expect(Array.isArray(res.body.usuarios)).toBe(true);
    });
  });

  describe('GET /usuarios/{_id}', () => {
    it('deve buscar um usuário por ID existente (cenário positivo)', async () => {
      const user = buildUser();
      const created = await request(BASE_URL).post('/usuarios').send(user);

      const res = await request(BASE_URL).get(`/usuarios/${created.body._id}`);

      expect(res.status).toBe(200);
      expect(res.body.email).toBe(user.email);
      expect(res.body._id).toBe(created.body._id);
    });

    it('deve retornar 400 ao buscar usuário com ID inexistente (cenário negativo)', async () => {
      // a API exige 16 caracteres alfanuméricos no formato do ID; caso contrário retorna outra mensagem de validação
      const res = await request(BASE_URL).get('/usuarios/idInexistente123');

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Usuário não encontrado');
    });
  });

  describe('PUT /usuarios/{_id}', () => {
    it('deve editar um usuário existente (cenário positivo)', async () => {
      const user = buildUser();
      const created = await request(BASE_URL).post('/usuarios').send(user);

      const res = await request(BASE_URL)
        .put(`/usuarios/${created.body._id}`)
        .send({ ...user, nome: 'Nome Atualizado' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Registro alterado com sucesso');
    });

    it('deve retornar 201 ao editar usuário com ID inexistente, criando um novo registro (edge case)', async () => {
      const user = buildUser();

      const res = await request(BASE_URL).put('/usuarios/idInexistente123').send(user);

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Cadastro realizado com sucesso');
      expect(res.body._id).toBeDefined();
    });
  });

  describe('DELETE /usuarios/{_id}', () => {
    it('deve excluir um usuário sem carrinho vinculado (cenário positivo)', async () => {
      const user = buildUser();
      const created = await request(BASE_URL).post('/usuarios').send(user);

      const res = await request(BASE_URL).delete(`/usuarios/${created.body._id}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Registro excluído com sucesso');
    });

    it('não deve excluir um usuário com carrinho vinculado (cenário negativo)', async () => {
      const adminToken = await authAsAdmin();
      const { id: productId } = await createProduct(adminToken);

      const user = buildUser();
      const created = await request(BASE_URL).post('/usuarios').send(user);
      const loginRes = await login(user.email, user.password);
      const userToken = loginRes.body.authorization;

      await createCart(userToken, [{ idProduto: productId, quantidade: 1 }]);

      const res = await request(BASE_URL).delete(`/usuarios/${created.body._id}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Não é permitido excluir usuário com carrinho cadastrado');
      expect(res.body.idCarrinho).toBeDefined();

      // limpeza: cancela a compra para liberar o estoque do produto
      await request(BASE_URL).delete('/carrinhos/cancelar-compra').set('Authorization', userToken);
    });

    it('deve retornar 200 e "Nenhum registro excluído" ao excluir usuário com ID inexistente (edge case)', async () => {
      const res = await request(BASE_URL).delete('/usuarios/idInexistente123');

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Nenhum registro excluído');
    });
  });
});

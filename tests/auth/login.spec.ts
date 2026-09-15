import request from 'supertest';
import { BASE_URL } from '../../config';
import { buildUser } from '../../fixtures/user.fixtures';
import { login } from '../../helpers/auth.helper';

describe('POST /login', () => {
  it('deve autenticar com sucesso usando credenciais válidas (cenário positivo)', async () => {
    const user = buildUser();
    await request(BASE_URL).post('/usuarios').send(user);

    const res = await login(user.email, user.password);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Login realizado com sucesso');
    expect(res.body.authorization).toMatch(/^Bearer /);
  });

  it('deve retornar 401 ao informar senha inválida (cenário negativo)', async () => {
    const user = buildUser();
    await request(BASE_URL).post('/usuarios').send(user);

    const res = await login(user.email, 'senha-incorreta');

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Email e/ou senha inválidos');
  });

  it('deve retornar 401 ao informar email inexistente (cenário negativo)', async () => {
    const res = await login('email-que-nao-existe@qa.com', 'qualquerSenha123');

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Email e/ou senha inválidos');
  });
});

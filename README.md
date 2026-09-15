# serverest-api-e2e

Testes automatizados de API (E2E) para o [ServeRest](https://compassuol.serverest.dev/), usando **Jest + Supertest + TypeScript**.

## Escopo

- `/login`
- `/usuarios`
- `/produtos`
- `/carrinhos`

## Como rodar

```bash
npm install
npm test
```

Scripts por domínio: `npm run test:auth`, `npm run test:users`, `npm run test:products`, `npm run test:cart`.

## Estrutura

```
fixtures/   -> massas de dados e factories
helpers/    -> funções utilitárias (auth, criação de usuário/produto, etc.)
tests/      -> specs organizados por domínio (auth, users, products, cart)
```

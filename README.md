# serverest-api-e2e

Testes automatizados de API E2E para o [ServeRest](https://compassuol.serverest.dev/), usando **Jest**, **Supertest** e **TypeScript**.

O projeto cobre os principais fluxos da API pública do ServeRest, validando cenários positivos, negativos e alguns comportamentos de borda observados durante a execução contra o ambiente real.

## Objetivo

Este repositório foi criado para praticar automação de testes de API, organizando os cenários por domínio funcional e reutilizando fixtures e helpers para reduzir repetição na preparação dos testes.

Os testes exercitam diretamente a API hospedada em:

```text
https://compassuol.serverest.dev
```

## Stack utilizada

- Node.js
- TypeScript
- Jest
- Supertest
- Faker (`@faker-js/faker`)
- Jest HTML Reporters

## Escopo dos testes

As suítes estão organizadas pelos seguintes domínios:

- `/login`
- `/usuarios`
- `/produtos`
- `/carrinhos`

## Pré-requisitos

- Node.js instalado.
- npm instalado.
- Acesso à internet para executar os testes contra a API pública do ServeRest.

## Instalação

```bash
npm install
```

## Como executar

Executar a suíte completa:

```bash
npm test
```

Executar por domínio:

```bash
npm run test:auth
npm run test:users
npm run test:products
npm run test:cart
```

## Relatório de execução

Após a execução dos testes, o relatório HTML é gerado em:

```text
reports/report.html
```

A pasta `reports/` não é versionada, pois contém arquivos gerados a cada execução.

## Estrutura do projeto

```text
fixtures/
  product.fixtures.ts   Massas e factories para produtos
  user.fixtures.ts      Massas e factories para usuários

helpers/
  auth.helper.ts        Funções de login e autenticação
  cart.helper.ts        Função utilitária para criação de carrinho
  product.helper.ts     Função utilitária para criação de produto

tests/
  auth/                 Specs da rota /login
  users/                Specs da rota /usuarios
  products/             Specs da rota /produtos
  cart/                 Specs da rota /carrinhos

config.ts               Configuração da URL base da API
jest.config.ts          Configuração do Jest e do relatório HTML
```
# Apêndice — Log de Solicitações e Ajustes (Desafio 2)

> Registro das solicitações feitas à IA (GitHub Copilot) e dos ajustes realizados durante a implementação do projeto `serverest-api-e2e`.

## 2026-09-13

1. **Definição de stack**: confirmado uso de **Jest + Supertest + TypeScript** em conjunto com o **GitHub Copilot** como assistente de IA.

2. **Solicitação**: criar a estrutura inicial do projeto `serverest-api-e2e/`.
   - **Ação da IA**: gerou `package.json`, `tsconfig.json`, `jest.config.ts`, `babel.config.js`, `config.ts` (com `BASE_URL` apontando para `https://compassuol.serverest.dev`), `README.md`, `.gitignore`, além das pastas `fixtures/` (com `user.fixtures.ts`, `product.fixtures.ts` usando `@faker-js/faker`), `helpers/` (com `auth.helper.ts`) e `tests/{auth,users,products,cart}/`.
   - **Ajuste manual**: remoção do arquivo `.gitkeep` de `helpers/` após a criação de um arquivo real (`auth.helper.ts`).

3. **Solicitação**: implementar o primeiro cenário automatizado da rota `/login` — um cenário positivo (login com sucesso) e cenários negativos (senha inválida e email inexistente).
   - **Ação da IA**: criado `tests/auth/login.spec.ts` com 3 casos:
     - Login com sucesso (200, mensagem "Login realizado com sucesso", `authorization` no formato Bearer).
     - Senha inválida (401, "Email e/ou senha inválidos").
     - Email inexistente (401, "Email e/ou senha inválidos").
   - Reutilizado o helper `login()` já existente em `helpers/auth.helper.ts` e a fixture `buildUser()` para gerar massa de dados via `@faker-js/faker`.
   - **Validação**: executado `npm run test:auth` contra a API real (`https://compassuol.serverest.dev`) — 3/3 testes passaram, relatório HTML gerado em `reports/report.html`.

5. **Solicitação**: implementar cenários positivos, negativos e edge-cases para a rota `/usuarios`, consultando o Swagger do ServeRest quando necessário.
   - **Ação da IA**: criado `tests/users/users.spec.ts` com 10 casos cobrindo POST, GET (lista e por ID), PUT e DELETE. Também criados os helpers `helpers/product.helper.ts` (`createProduct`) e `helpers/cart.helper.ts` (`createCart`), reutilizando `authAsAdmin()` já existente, para simular o cenário de exclusão de usuário com carrinho vinculado.
   - **Bug encontrado durante a execução**: o teste "buscar usuário com ID inexistente" usava `999999` esperando `400` com mensagem `"Usuário não encontrado"`, mas a API valida o formato do ID antes (exige 16 caracteres alfanuméricos) e retornou uma mensagem de validação diferente (`"id deve ter exatamente 16 caracteres alfanuméricos"`).
     - **Ajuste**: troquei o ID de teste para um valor de 16 caracteres alfanuméricos inexistente (`idInexistente123`), que corretamente resulta em `"Usuário não encontrado"`. Documentado como comentário no spec.
   - **Observação (edge case confirmado)**: `PUT /usuarios/{id}` com ID inexistente **cria** um novo usuário (201), em vez de retornar erro — comportamento peculiar da API, confirmado no plano de testes do Desafio 1 e validado na execução.
   - **Validação**: executado `npm run test:users` — 10/10 testes passaram após o ajuste.

6. **Solicitação**: implementar cenários positivos, negativos e edge-cases para a rota `/produtos`, consultando o Swagger do ServeRest quando necessário.
   - **Ação da IA**: criado `tests/products/products.spec.ts` com 13 casos cobrindo POST (admin, sem token, token não-admin, nome duplicado), GET (lista e por ID), PUT e DELETE (com/sem carrinho vinculado, sem token, token não-admin, ID inexistente). Adicionado o helper `authAsUser()` em `helpers/auth.helper.ts` para gerar tokens de usuário comum (não administrador), reutilizado também nos testes de `/produtos`.
   - **Validação prévia via `curl`**: antes de escrever as asserções de erro (token ausente, rota exclusiva para admin), confirmei o texto exato das mensagens retornadas pela API real para evitar suposições incorretas.
   - **Validação**: executado `npm run test:products` — 13/13 testes passaram de primeira, sem necessidade de ajustes adicionais.

7. **Solicitação**: implementar cenários positivos, negativos e edge-cases para a rota `/carrinhos`, consultando o Swagger do ServeRest quando necessário.
   - **Ação da IA**: criado `tests/cart/cart.spec.ts` com 13 casos cobrindo POST (criação válida com redução de estoque, sem token, produto inexistente, produto duplicado, segundo carrinho para o mesmo usuário, quantidade acima do estoque), GET (lista e por ID inexistente), `DELETE /carrinhos/concluir-compra` (sucesso, sem carrinho — edge case, sem token) e `DELETE /carrinhos/cancelar-compra` (sucesso com devolução ao estoque, sem token).
   - **Validação prévia via `curl`**: testadas as respostas reais para `concluir-compra`/`cancelar-compra` sem carrinho cadastrado e `GET /carrinhos/{id}` inexistente, para garantir mensagens e status corretos antes de escrever as asserções.
   - **Bug encontrado durante a execução**: o teste de "cancelar compra" esperava a mensagem `"Registro excluído com sucesso"` (igual à de "concluir compra"), mas a API retorna uma mensagem diferente e mais específica: `"Registro excluído com sucesso. Estoque dos produtos reabastecido"`.
     - **Ajuste**: corrigida a asserção para o texto exato retornado pela API.
   - **Validação**: executado `npm run test:cart` — 13/13 testes passaram após o ajuste.

8. **Consolidação**: executado `npm test` (suíte completa: auth, users, products, cart) — **39/39 testes passaram**, relatório HTML consolidado gerado em `reports/report.html`.

> **Observação geral**: diferente do Desafio 1 (planos de teste manuais), onde foram necessários vários ajustes de premissas e redações dos cenários, na automação os ajustes se limitaram a corrigir mensagens/asserções específicas divergentes do comportamento real da API (validação de formato de ID, texto de "cancelar compra"). Os cenários planejados no Desafio 1 já fizeram com que o Desafio 2 caminhasse bem!

# 🏖️ Delivery Torres App — Monolito Modular

Trabalho prático de **Arquitetura de Software (3º semestre de ADS)**.

**Cenário do enunciado:** somos o time inicial de uma startup, com 4 desenvolvedores, orçamento pequeno de infraestrutura e 1 mês para colocar no ar um app de delivery focado na alta temporada de verão em **Torres/RS**. A diretoria quer saber como o sistema vai ser organizado. A nossa resposta é um **monolito modular**, e o resto deste README mostra, no próprio código, por que essa é uma boa decisão para esse momento da empresa.

O foco aqui é a organização (como o código está dividido e como as partes conversam), não as regras de negócio completas.

### 👥 Integrantes do grupo
* **Ulisses**
* **Leonardo Borba**
* **Joel**
* **Pedro**
* **Adalicio**

---

## 1. Estrutura de pastas

```text
delivery-torres-app/
├── src/
│   ├── modules/
│   │   ├── usuarios/        # controller, service, entity, module
│   │   ├── restaurantes/
│   │   ├── cardapio/
│   │   ├── pedidos/         # orquestra o fluxo principal
│   │   ├── pagamentos/      # ✂️ primeiro candidato a microsserviço
│   │   └── notificacoes/
│   ├── shared/              # LoggerService e AuthGuard (usados por vários módulos)
│   ├── database/            # uma conexão, um banco
│   ├── app.module.ts        # registra todos os módulos
│   └── main.ts              # um único ponto de entrada
├── package.json             # um só
└── Dockerfile               # um só deploy
```

## 2. Diagrama da arquitetura

```text
┌────────────────────────── delivery-torres-app (1 processo, 1 deploy) ──────────────────────────┐
│                                                                                                │
│  ┌──────────┐  ┌──────────────┐  ┌──────────┐  ┌──────────┐  ┌╌╌╌╌╌╌╌╌╌╌╌╌╌┐  ┌──────────────┐ │
│  │ usuarios │  │ restaurantes │  │ cardapio │  │ pedidos  │  ╎ pagamentos ✂️╎  │ notificacoes │ │
│  └──────────┘  └──────────────┘  └──────────┘  └──────────┘  └╌╌╌╌╌╌╌╌╌╌╌╌╌┘  └──────────────┘ │
│                                        │                                                       │
│                  pedidos orquestra os outros módulos via chamadas de função                    │
│                                                                                                │
│  ┌─────────────────────────────────────── shared/ ───────────────────────────────────────────┐ │
│  │                        AuthGuard (autenticação)  |  LoggerService                         │ │
│  └───────────────────────────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────┬────────────────────────────────────────────────┘
                                                │ (conexão única)
                                        ┌───────┴───────┐
                                        │  Banco Único  │
                                        │    SQLite     │
                                        └───────────────┘
```

O tracejado marca o módulo ✂️ (explicado na seção 6). O banco é um SQLite embutido no processo (via `sql.js`), então o sistema todo sobe com um comando só.

## 3. Caminho de uma requisição (criar um pedido)

```text
POST /pedidos
  → PedidosController.criar()
    → PedidosService.criar()
      → UsuariosService.validarCliente()
      → RestaurantesService.verificarDisponibilidade()
      → CardapioService.validarItensECalcularTotal()
      → [transação única]
          → PagamentosService.cobrar(pedidoId, valor, manager)
      → NotificacoesService.avisarRestaurante()
```

Cada seta é uma **chamada de função dentro do mesmo processo**. Não existe HTTP, fila nem rede entre os módulos. A notificação só sai depois do COMMIT, para o restaurante nunca ser avisado de um pedido que foi desfeito.

## 4. As três vantagens provadas no código

### 4.1 Transação única
**Onde:** `src/modules/pedidos/pedidos.service.ts`, método `criar()`.

```ts
pedidoSalvo = await this.dataSource.transaction(async (manager) => {
  const pedido = manager.create(Pedido, { ... status: 'CONFIRMADO' });
  await manager.save(pedido);
  // se a cobrança falhar, o pedido também é desfeito
  await this.pagamentosService.cobrar(pedido.id, valorTotal, manager, requestId);
  return pedido;
});
```

O pedido (módulo `pedidos`) e o pagamento (módulo `pagamentos`) são gravados na **mesma transação do mesmo banco**: o `manager` é passado de um módulo para o outro. Como testar:

```bash
# pedido normal (2 itens = R$ 90): grava pedido e pagamento
curl -X POST localhost:3000/pedidos -H "Content-Type: application/json" \
  -d '{"usuarioId":"u1","restauranteId":"r1","itensIds":["a","b"]}'

# pedido que o gateway recusa (8 itens = R$ 360, acima do limite de R$ 300)
curl -X POST localhost:3000/pedidos -H "Content-Type: application/json" \
  -d '{"usuarioId":"u1","restauranteId":"r1","itensIds":["a","b","c","d","e","f","g","h"]}'

curl localhost:3000/pedidos      # só o pedido normal aparece
curl localhost:3000/pagamentos   # só o pagamento do pedido normal aparece
```

No segundo caso o pedido chega a ser gravado dentro da transação, a cobrança é recusada, e o ROLLBACK desfaz tudo: o pedido não fica no banco.

### 4.2 Execução simples
Um único comando sobe o sistema inteiro:

```bash
npm install
npm run start
```

É um processo, um `package.json`, um `main.ts` e um `Dockerfile`. O banco roda embutido, então não precisa subir mais nada.

### 4.3 Debug fácil
Cada pedido recebe um `requestId` (em `PedidosService.criar()`), e esse ID é passado para todos os módulos, que o escrevem em cada log. Com um único filtro (`grep req-a83b7de5`) o log mostra o caminho completo, do controller ao último service:

```text
[ReqID: req-a83b7de5] [PedidosService] 1. Validando cliente e restaurante...
[ReqID: req-a83b7de5] [UsuariosService] Validando cliente u1
[ReqID: req-a83b7de5] [RestaurantesService] Verificando disponibilidade do restaurante r1
[ReqID: req-a83b7de5] [CardapioService] 2 item(ns) validados, total R$ 90
[ReqID: req-a83b7de5] [PedidosService] 3. Abrindo TRANSAÇÃO ÚNICA (pedido + pagamento)...
[ReqID: req-a83b7de5] [PagamentosService] Cobrando R$ 90 do pedido ...
[ReqID: req-a83b7de5] [PedidosService] COMMIT: pedido ... e pagamento salvos juntos
[ReqID: req-a83b7de5] [NotificacoesService] Restaurante r1 avisado sobre o pedido ...
```

Como tudo roda no mesmo processo, também dá para colocar **um único breakpoint** em `PedidosService.criar()` e entrar (step into) em cada módulo na mesma pilha de chamadas, sem precisar ligar o debugger em vários serviços.

## 5. Regras do monolito modular

* **Módulos só conversam pelo service público.** `pedidos` usa `UsuariosService`, `RestaurantesService`, `CardapioService`, `PagamentosService` e `NotificacoesService` (cada módulo só exporta o service). Nenhum módulo importa a entity de outro.
* **Cada módulo é dono das suas tabelas.** Cada entity fica na pasta do próprio módulo e é registrada só ali (`TypeOrmModule.forFeature`). Quando uma tabela precisa referenciar outro módulo, guarda só o id (ex.: `Pagamento.pedidoId`), sem relação direta.
* **Código compartilhado fica em `shared/`.** `LoggerService` e `AuthGuard`, expostos pelo `SharedModule`.
* **Uma conexão, um banco.** Configurada uma vez em `database/database.module.ts`.

## 6. Marcação de corte ✂️: `pagamentos`

Marcamos `pagamentos` porque ele concentra a integração com serviços externos (gateway) e dados sensíveis, tem requisitos de segurança e ritmo de deploy diferentes do resto, e já é acessado por uma única porta (`PagamentosService.cobrar`), o que deixa o corte barato. Na alta temporada, uma falha no gateway também não deveria derrubar cardápio e pedidos.

Ao extrair o módulo, duas coisas vão mudar: a chamada `cobrar()` deixa de ser uma chamada de função e vira uma chamada de rede, e o `manager` da transação deixa de poder ser compartilhado, então a transação única entre pedido e pagamento deixa de existir.

## 7. Como rodar

```bash
npm install
npm run start        # sobe em http://localhost:3000
```

Rotas: `POST /pedidos`, `GET /pedidos`, `GET /pagamentos`. Com Docker: `docker build -t delivery-torres-app . && docker run -p 3000:3000 delivery-torres-app`.

## Observações

* O banco é SQLite em memória (`sql.js`): os dados somem quando o app reinicia. Para o enunciado, isso mantém "um comando sobe tudo". Em produção dá para trocar por PostgreSQL mudando o driver e a configuração em `database/`.
* O gateway de pagamento é simulado (recusa cobranças acima de R$ 300) para demonstrar o rollback.
* As regras de negócio dos outros módulos são simplificadas de propósito (por exemplo, cada item do cardápio custa R$ 45), porque o foco do trabalho é a organização modular.

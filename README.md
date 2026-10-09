# Verzel Store: validação da entrega VZS-142 (cupom de desconto e frete grátis)

Teste técnico para a vaga de **QA Júnior** na Verzel, por **Brenda Beatriz Maciel da Silva**.

Validação da entrega "Cupom de desconto e frete grátis" (card VZS-142, v2.3.0) da [Verzel Store](https://verzel-store.qa-test-verzel-store.workers.dev), feita a partir da [documentação da entrega](https://verzel-store.qa-test-verzel-store.workers.dev/documentacao).

## Resultado em uma linha

**51 cenários executados: 45 passaram e 6 falharam, com 3 bugs abertos.** Dois deles violam critérios de aceite (CA06 e CA10), então a entrega **não está pronta para produção**.

| Bug | Resumo | Severidade |
|---|---|---|
| [BUG-01](docs/03-bugs.md#bug-01) | Subtotal de **exatamente R$ 200,00** cobra frete de R$ 19,90, e a tela mostra "Faltam R$ 0,00 para o frete grátis." | Alta |
| [BUG-02](docs/03-bugs.md#bug-02) | A API aceita **mais de 5 unidades** por produto e confirma o pedido (a interface bloqueia, a API não) | Alta |
| [BUG-03](docs/03-bugs.md#bug-03) | Item sem `produtoId` retorna "Produto **undefined** não encontrado." em vez de `ITEM_INVALIDO` | Baixa |

## Onde está cada entrega

| Entrega pedida | Onde encontrar |
|---|---|
| Cenários de teste (Gherkin) | [`docs/01-cenarios/`](docs/01-cenarios): 7 arquivos `.feature`, 51 cenários (CT01 a CT51) com tags por critério de aceite (`@CA01`...), camada (`@ui`/`@api`) e tipo (`@manual`/`@exploratorio`/`@automatizado`) |
| Execução manual e exploratória, com resultado de cada cenário | [`docs/02-execucao.md`](docs/02-execucao.md): resultado por cenário e por critério de aceite, sessões exploratórias, interpretações de ambiguidades e sugestões de melhoria |
| Report dos bugs | [`docs/03-bugs.md`](docs/03-bugs.md): passos, esperado x obtido, severidade, análise e evidências |
| Evidências da execução | [`docs/04-evidencias.md`](docs/04-evidencias.md): screenshots de cada cenário ([`img/`](docs/evidencias/img)) e [log completo da API](docs/evidencias/api-log.md) |
| Automação com Playwright | [`tests/`](tests): 33 testes (14 de UI e 19 de API) |
| README | este arquivo |

```
.
├── docs/
│   ├── 01-cenarios/          # cenários em Gherkin (pt-BR)
│   ├── 02-execucao.md        # relatório de execução
│   ├── 03-bugs.md            # bugs encontrados
│   ├── 04-evidencias.md      # índice visual das evidências
│   └── evidencias/
│       ├── img/              # screenshots por cenário
│       └── api-log.md        # requisições e respostas da API
├── scripts/
│   └── coletar-evidencias.mjs  # gera docs/evidencias
├── tests/
│   ├── support/pages.ts      # page objects (Vitrine, Carrinho, Checkout)
│   ├── ui/                   # cupom, frete, quantidade, checkout
│   └── api/                  # carrinho, produtos e pedidos
└── playwright.config.ts
```

## Como rodar a automação

**Pré-requisitos:** [Node.js](https://nodejs.org) 18 ou superior.

```bash
# 1. instalar as dependências
npm install

# 2. instalar o navegador usado pelo Playwright
npx playwright install chromium

# 3. rodar todos os testes (UI + API)
npm test
```

Outros comandos:

| Comando | O que faz |
|---|---|
| `npm run test:ui` | só os testes de interface |
| `npm run test:api` | só os testes de API |
| `npm run test:headed` | testes de interface com o navegador visível |
| `npm run report` | abre o relatório HTML da última execução (com screenshot de cada teste) |
| `npm run evidencias` | regera os screenshots e o log da API em `docs/evidencias/` |
| `npx playwright test --grep @CA10` | roda só os testes de um critério de aceite (ou `--grep @BUG-01` para um bug) |

Para apontar para outro ambiente: `BASE_URL=https://outro-endereco npm test`.

### Resultado esperado da execução

```
33 passed
```

Na saída do terminal, 5 desses testes aparecem com `x` vermelho. Isso é intencional, como explicado abaixo.

### Bugs conhecidos na automação

Os testes que cobrem os bugs (**CT13** em UI e API, **CT21**, **CT22** e **CT34**) verificam o **comportamento esperado pela documentação** e estão marcados com `test.fail()` e uma anotação `bug`:

- **Enquanto o bug existir**, o teste falha como esperado, e a suíte continua verde para não esconder regressões nos outros cenários.
- **Quando o bug for corrigido**, o Playwright acusa "expected to fail, but passed". Esse é o sinal para remover o `test.fail()` e transformar o teste em regressão permanente.

### Decisões da automação

- **Page Objects** em [`tests/support/pages.ts`](tests/support/pages.ts), com seletores por papel e nome acessível (`getByRole`) e pelos atributos estáveis da loja (`data-valor`, `id`).
- **Pré-condição via `sessionStorage`:** a loja guarda o carrinho na aba (`verzel-store:itens`). Para os cenários que começam com "Dado que o carrinho tem...", o carrinho é preparado direto no storage, o que deixa os testes rápidos e independentes. O fluxo real pela vitrine é coberto em `quantidade.spec.ts` e no CT42 (compra completa).
- **Esperas pela API, não por tempo fixo:** os testes aguardam a resposta de `/api/carrinho/calcular` e o `aria-busy="false"` do resumo antes de conferir valores.
- **Ambiente compartilhado:** `workers: 2`, sem testes de carga, e cada teste roda em um contexto de navegador isolado, então um teste não interfere no carrinho de outro.

## Escopo

**Dentro do escopo:** todos os critérios de aceite (CA01 a CA11), as regras de cálculo, as regras pré-existentes do checkout (nome, e-mail, CEP), o contrato e os códigos de erro da API, e a navegação básica.

**Fora do escopo** (conforme o enunciado e a seção "Sobre este ambiente"): testes de carga, estresse e segurança; login, cadastro, pagamento online e consulta de pedidos. Os comportamentos simplificados de propósito (carrinho por aba, pedido não armazenado, número fictício, sem estoque) foram apenas confirmados e **não** foram reportados como bug.

## Uso de IA

Usei o Claude (Anthropic) como assistente durante o teste: na leitura da documentação para levantar os cenários, para gerar os scripts de exploração da API e da interface, para escrever a automação Playwright e o script de evidências, e para revisar e organizar a documentação. Todos os resultados foram executados contra o ambiente real e conferidos nos screenshots e nas respostas da API antes de serem registrados.

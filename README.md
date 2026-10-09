# Verzel Store: validação da entrega VZS-142 (cupom de desconto e frete grátis)

Teste técnico para a vaga de **QA Júnior** na Verzel, por **Brenda Beatriz Maciel da Silva**.

Validação da entrega "Cupom de desconto e frete grátis" (card VZS-142, v2.3.0) da [Verzel Store](https://verzel-store.qa-test-verzel-store.workers.dev), feita a partir da [documentação da entrega](https://verzel-store.qa-test-verzel-store.workers.dev/documentacao).

## Resultado em uma linha

**72 cenários executados: 62 passaram e 10 falharam, com 7 bugs abertos.** Dois deles violam critérios de aceite (CA06 e CA10), então a entrega **não está pronta para produção**.

- **Critérios de aceite do card:** 51 cenários e 3 bugs ([relatório](docs/02-execucao.md)).
- **Testes complementares,** além do exigido (navegação, carrinho, checkout, celular, Firefox/Safari, teclado): 21 cenários e 4 bugs ([relatório](docs/05-testes-complementares.md)).

| Bug | Resumo | Severidade |
|---|---|---|
| [BUG-01](docs/03-bugs.md#bug-01) | Subtotal de **exatamente R$ 200,00** cobra frete de R$ 19,90, e a tela mostra "Faltam R$ 0,00 para o frete grátis." | Alta |
| [BUG-02](docs/03-bugs.md#bug-02) | A API aceita **mais de 5 unidades** por produto e confirma o pedido (a interface bloqueia, a API não) | Alta |
| [BUG-03](docs/03-bugs.md#bug-03) | Item sem `produtoId` retorna "Produto **undefined** não encontrado." em vez de `ITEM_INVALIDO` | Baixa |
| [BUG-04](docs/03-bugs.md#bug-04) | Remover o último item mantém o cupom, que volta aplicado sozinho no próximo produto | Baixa |
| [BUG-05](docs/03-bugs.md#bug-05) | Nome só com números ("123 456") é aceito; a confirmação diz "Obrigado, 123." | Baixa |
| [BUG-06](docs/03-bugs.md#bug-06) | E-mail com pontos seguidos (`maria@exemplo..com`) é aceito | Baixa |
| [BUG-07](docs/03-bugs.md#bug-07) | No celular, os links "Produtos" e "Documentação" somem do menu, sem menu alternativo | Baixa |

## Onde está cada entrega

| Entrega pedida | Onde encontrar |
|---|---|
| Cenários de teste (Gherkin) | [`docs/01-cenarios/`](docs/01-cenarios): 8 arquivos `.feature`, 72 cenários (CT01 a CT72) com tags por critério de aceite (`@CA01`...), camada (`@ui`/`@api`), tipo (`@manual`/`@exploratorio`/`@automatizado`) e bug (`@BUG-01`...) |
| Execução manual e exploratória, com resultado de cada cenário | [`docs/02-execucao.md`](docs/02-execucao.md) (critérios de aceite) e [`docs/05-testes-complementares.md`](docs/05-testes-complementares.md) (além do exigido): resultado por cenário, sessões exploratórias, interpretações de ambiguidades e sugestões |
| Report dos bugs | [`docs/03-bugs.md`](docs/03-bugs.md): 7 bugs com passos, esperado x obtido, severidade, análise e evidências |
| Evidências da execução | [`docs/04-evidencias.md`](docs/04-evidencias.md): screenshots de cada cenário ([`img/`](docs/evidencias/img)) e [log completo da API](docs/evidencias/api-log.md) |
| Automação com Playwright | [`tests/`](tests): 46 testes (25 de UI e 21 de API) |
| Coleção Postman (extra) | [`docs/postman/`](docs/postman): 37 requisições com 123 verificações automáticas, incluindo a reprodução dos bugs de API ([como importar](docs/postman/README.md)) |
| README | este arquivo |

```
.
├── docs/
│   ├── 01-cenarios/          # cenários em Gherkin (pt-BR)
│   ├── 02-execucao.md        # relatório de execução
│   ├── 03-bugs.md            # bugs encontrados
│   ├── 04-evidencias.md      # índice visual das evidências
│   ├── 05-testes-complementares.md  # testes além dos critérios de aceite
│   ├── postman/              # coleção Postman + resultado da execução
│   └── evidencias/
│       ├── img/              # screenshots por cenário
│       └── api-log.md        # requisições e respostas da API
├── scripts/
│   └── coletar-evidencias.mjs  # gera docs/evidencias
├── tests/
│   ├── support/pages.ts      # page objects (Vitrine, Carrinho, Checkout)
│   ├── ui/                   # cupom, frete, quantidade, checkout, complementares (inclui celular)
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
| `npm run evidencias` | regera os screenshots e o log da API em `docs/evidencias/` (antes, rode `npx playwright install` para baixar também o Firefox e o WebKit) |
| `npm run test:postman` | roda a coleção Postman pelo terminal (via Newman), sem abrir o Postman |
| `npx playwright test --grep @CA10` | roda só os testes de um critério de aceite (ou `--grep @BUG-01` para um bug) |

Para apontar para outro ambiente: `BASE_URL=https://outro-endereco npm test`.

### Resultado esperado da execução

```
46 passed
```

Na saída do terminal, 9 desses testes aparecem com `x` vermelho. Isso é intencional, como explicado abaixo.

### Bugs conhecidos na automação

Os 9 testes que cobrem os bugs (**CT13** em UI e API, **CT21**, **CT22**, **CT34**, **CT59**, **CT68**, **CT69** e **CT72**) verificam o **comportamento esperado** e estão marcados com `test.fail()` e uma anotação `bug`:

- **Enquanto o bug existir**, o teste falha como esperado, e a suíte continua verde para não esconder regressões nos outros cenários.
- **Quando o bug for corrigido**, o Playwright acusa "expected to fail, but passed". Esse é o sinal para remover o `test.fail()` e transformar o teste em regressão permanente.

### Decisões da automação

- **Page Objects** em [`tests/support/pages.ts`](tests/support/pages.ts), com seletores por papel e nome acessível (`getByRole`) e pelos atributos estáveis da loja (`data-valor`, `id`).
- **Pré-condição via `sessionStorage`:** a loja guarda o carrinho na aba (`verzel-store:itens`). Para os cenários que começam com "Dado que o carrinho tem...", o carrinho é preparado direto no storage, o que deixa os testes rápidos e independentes. O fluxo real pela vitrine é coberto em `quantidade.spec.ts` e no CT42 (compra completa).
- **Esperas pela API, não por tempo fixo:** os testes aguardam a resposta de `/api/carrinho/calcular` e o `aria-busy="false"` do resumo antes de conferir valores.
- **Ambiente compartilhado:** `workers: 2`, sem testes de carga, e cada teste roda em um contexto de navegador isolado, então um teste não interfere no carrinho de outro.

## Escopo

**Dentro do escopo:** todos os critérios de aceite (CA01 a CA11), as regras de cálculo, as regras pré-existentes do checkout (nome, e-mail, CEP), o contrato e os códigos de erro da API e, como teste complementar, as demais funcionalidades da loja: navegação, documentação, celular (320px e 390px), Firefox e WebKit (Safari) e navegação por teclado.

**Fora do escopo** (conforme o enunciado e a seção "Sobre este ambiente"): testes de carga, estresse e segurança; login, cadastro, pagamento online e consulta de pedidos. Os comportamentos simplificados de propósito (carrinho por aba, pedido não armazenado, número fictício, sem estoque) foram apenas confirmados e **não** foram reportados como bug.

## Uso de IA

Usei o Claude (Anthropic) como assistente durante o teste: na leitura da documentação para levantar os cenários, para gerar os scripts de exploração da API e da interface, para escrever a automação Playwright e o script de evidências, e para revisar e organizar a documentação. Todos os resultados foram executados contra o ambiente real e conferidos nos screenshots e nas respostas da API antes de serem registrados.

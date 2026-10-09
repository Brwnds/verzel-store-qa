# Relatório de testes complementares

Testes **além dos critérios de aceite** do card VZS-142. O objetivo foi verificar as funcionalidades em volta da entrega (navegação, carrinho, checkout, documentação) e a loja em outros contextos de uso (celular, outros navegadores, teclado), procurando bugs que os critérios não cobrem.

| | |
|---|---|
| **Ambiente** | https://verzel-store.qa-test-verzel-store.workers.dev (v2.3.0) |
| **Data** | 09/10/2026 |
| **Navegadores** | Chromium, Firefox e WebKit (motor do Safari), via Playwright 1.48 |
| **Dispositivos** | Desktop 1280x900, iPhone 12 (390px) e Galaxy S9+ (320px) |
| **Cenários** | [08-complementares.feature](https://github.com/Brwnds/verzel-store-qa/blob/main/docs/01-cenarios/08-complementares.feature) |

## Resumo

| Cenários | Passou | Falhou | Bugs novos |
|---|---|---|---|
| **21** (CT52 a CT72) | **17** | **4** | **4**, todos de severidade baixa |

| Bug | Resumo | Severidade |
|---|---|---|
| [BUG-04](03-bugs.md#bug-04) | Remover o último item mantém o cupom salvo; ao adicionar outro produto, o cupom volta aplicado sozinho. "Esvaziar carrinho" não tem esse problema. | Baixa |
| [BUG-05](03-bugs.md#bug-05) | Nome só com números ("123 456") é aceito como nome e sobrenome, e a confirmação diz "Obrigado, 123." | Baixa |
| [BUG-06](03-bugs.md#bug-06) | E-mail com pontos seguidos no domínio (`maria@exemplo..com`) é aceito | Baixa |
| [BUG-07](03-bugs.md#bug-07) | No celular, os links "Produtos" e "Documentação" ficam ocultos e não existe menu alternativo | Baixa |

**Conclusão:** as funcionalidades em volta da entrega são estáveis. O fluxo de compra funciona nos três navegadores, o layout se adapta ao celular sem rolagem horizontal, a navegação por teclado tem foco visível e não há erros no console. Os bugs encontrados não bloqueiam a compra: são de validação de dados (BUG-05, BUG-06), de consistência no carrinho (BUG-04) e de usabilidade no celular (BUG-07).

## Resultado por cenário

### Vitrine e navegação

| ID | Cenário | Tipo | Resultado | Evidência |
|---|---|---|---|---|
| CT52 | Contador soma produtos diferentes (1+2+1 = 4) | Manual + Automatizado | ✅ Passou | [img](evidencias/img/CT52-contador-produtos-diferentes.png) |
| CT53 | Menu, logo e "Ver as regras da promoção" levam à página certa; o item atual fica marcado | Manual + Automatizado | ✅ Passou | automação `complementares.spec.ts` |
| CT54 | "Ver produtos", "Continuar comprando" e "Voltar ao carrinho" | Manual + Automatizado | ✅ Passou | automação `complementares.spec.ts` |
| CT55 | Botão da vitrine reabilita ao reduzir de 5 para 4 no carrinho | Manual + Automatizado | ✅ Passou | [img](evidencias/img/CT55-vitrine-reabilita-apos-reduzir.png) |

### Carrinho com cupom aplicado

| ID | Cenário | Tipo | Resultado | Evidência |
|---|---|---|---|---|
| CT56 | Enter aplica o cupom | Exploratório + Automatizado | ✅ Passou | automação `complementares.spec.ts` |
| CT57 | Com cupom, subir de R$ 139,90 para R$ 279,80: desconto recalculado e frete grátis | Exploratório + Automatizado | ✅ Passou | [img](evidencias/img/CT57-cupom-quantidade-sobe-acima-200.png) |
| CT58 | Com cupom, descer de R$ 279,80 para R$ 139,90: frete volta a ser cobrado | Exploratório + Automatizado | ✅ Passou | [img](evidencias/img/CT58-cupom-quantidade-desce-abaixo-200.png) |
| CT59 | **Remover o último item limpa o cupom** | Exploratório + Automatizado | ❌ **Falhou ([BUG-04](03-bugs.md#bug-04))** | [1](evidencias/img/CT59-BUG04-1-cupom-aplicado.png) / [2](evidencias/img/CT59-BUG04-2-carrinho-vazio.png) / [3](evidencias/img/CT59-BUG04-3-cupom-volta-sozinho.png) |
| CT60 | "Esvaziar carrinho" limpa o cupom | Manual | ✅ Passou | [img](evidencias/img/CT60-esvaziar-limpa-cupom.png) |

### Checkout e pedido

| ID | Cenário | Tipo | Resultado | Evidência |
|---|---|---|---|---|
| CT61 | Clique duplo em "Confirmar pedido" gera 1 pedido | Exploratório + Automatizado | ✅ Passou | automação `complementares.spec.ts` |
| CT62 | /checkout com carrinho vazio redireciona ao carrinho | Exploratório + Automatizado | ✅ Passou | automação `complementares.spec.ts` |
| CT63 | "Voltar" do navegador depois do pedido mostra o carrinho vazio, sem reenviar | Exploratório | ✅ Passou | log da sessão S9 abaixo |
| CT68 | **Nome só com números é recusado** | Exploratório + Automatizado | ❌ **Falhou ([BUG-05](03-bugs.md#bug-05))** | [img](evidencias/img/CT68-BUG05-nome-numerico-confirmado.png) / [api-log](evidencias/api-log.md#ct68---nome-só-com-números-123-456---bug-05) |
| CT69 | **E-mail com ".." no domínio é recusado** | Exploratório + Automatizado | ❌ **Falhou ([BUG-06](03-bugs.md#bug-06))** | [api-log](evidencias/api-log.md#ct69---e-mail-com-pontos-seguidos-mariaexemplocom---bug-06) |
| CT70 | Formulário e API aceitam ou recusam os mesmos valores (10 entradas) | Manual | ✅ Passou: 100% consistentes | [tabela](evidencias/api-log.md#ct70---validação-do-formulário-x-validação-da-api) |

### Documentação, compatibilidade e acessibilidade

| ID | Cenário | Tipo | Resultado | Evidência |
|---|---|---|---|---|
| CT64 | Os 7 links do menu "Nesta página" levam à seção certa | Manual + Automatizado | ✅ Passou | [img](evidencias/img/CT64-documentacao-ancora-codigos-erro.png) |
| CT65 | Sem rolagem horizontal no celular (4 páginas x 2 aparelhos) | Manual + Automatizado | ✅ Passou | [tabela](evidencias/api-log.md#ct65---celular-largura-da-página-x-largura-da-tela) / [vitrine](evidencias/img/CT65-mobile-vitrine.png) / [carrinho](evidencias/img/CT65-mobile-carrinho.png) / [checkout](evidencias/img/CT65-mobile-checkout.png) |
| CT66 | Navegação por teclado: ordem do Tab, foco visível, Enter e Espaço | Exploratório | ✅ Passou | [img](evidencias/img/CT66-teclado-foco-e-enter.png) |
| CT67 | Compra completa no Firefox e no WebKit | Manual | ✅ Passou | [Firefox](evidencias/img/CT67-firefox-pedido-confirmado.png) / [WebKit](evidencias/img/CT67-webkit-pedido-confirmado.png) |
| CT71 | Nenhum erro de JavaScript no console em todas as páginas | Exploratório | ✅ Passou | log da sessão S8 abaixo |
| CT72 | **Menu completo no celular** | Exploratório + Automatizado | ❌ **Falhou ([BUG-07](03-bugs.md#bug-07))** | [img](evidencias/img/CT72-BUG07-menu-oculto-celular.png) |

## Sessões exploratórias

| # | Objetivo (charter) | Duração aprox. | O que encontrei |
|---|---|---|---|
| S6 | Explorar o **cupom ao longo da vida do carrinho**: mudar quantidades, remover itens, esvaziar, voltar à vitrine | 20 min | **BUG-04.** Recálculo de desconto e frete correto ao cruzar R$ 200,00 nos dois sentidos. |
| S7 | Explorar a **validação dos dados do cliente** com valores incomuns e comparar formulário com API | 20 min | **BUG-05 e BUG-06.** Formulário e API 100% consistentes entre si; o problema está na regra, não na integração. |
| S8 | Percorrer a loja em **celular, Firefox, WebKit e só com o teclado** | 25 min | **BUG-07.** Layout sem rolagem horizontal, foco visível em todos os elementos, nenhum erro no console. Um "falso alarme" no WebKit (a tela foi lida antes de renderizar) foi repetido 3 vezes e descartado. |
| S9 | Tentar **quebrar o envio do pedido**: clique duplo, voltar/avançar no navegador, checkout sem itens, confirmação acessada direto | 15 min | Sem falhas: 1 pedido por clique duplo; voltar leva ao carrinho vazio; checkout vazio redireciona. |

## O que foi observado, mas não reportado como bug

- **CEP `00000-000` é aceito.** A documentação pede só "8 dígitos, com ou sem hífen", e sem consulta a uma base de CEPs não há como validar se o CEP existe. Fica como sugestão.
- **Nome com 300 caracteres é aceito.** Não há limite documentado. Fica como sugestão definir um tamanho máximo.
- **`a@b.c` é aceito.** É um formato sintaticamente válido.
- **No celular, o selo "store" ao lado do logo some.** É uma simplificação visual, sem perda de função.

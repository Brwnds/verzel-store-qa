# Evidências da execução

Todas as evidências foram geradas em 09/10/2026 contra https://verzel-store.qa-test-verzel-store.workers.dev e podem ser regeradas com:

```bash
npm run evidencias
```

O script [`scripts/coletar-evidencias.mjs`](https://github.com/Brwnds/verzel-store-qa/blob/main/scripts/coletar-evidencias.mjs) abre a loja no Chromium, executa cada cenário e salva:

- **Screenshots** em [`evidencias/img/`](evidencias/img). O contorno vermelho destaca a área verificada.
- **Log da API** em [`evidencias/api-log.md`](evidencias/api-log.md), com a requisição e a resposta completas de cada cenário de API, a tabela dos 40 carrinhos do CT25 (CA11) e as requisições de rede da interface.

Além disso, cada execução da suíte Playwright gera um relatório HTML com screenshot de cada teste (`npm run report`).

O resultado de cada cenário está em [02-execucao.md](02-execucao.md) e os bugs em [03-bugs.md](03-bugs.md).

---

## Bugs

### BUG-01: subtotal de R$ 200,00 cobra frete (CT13)
![CT13](evidencias/img/CT13-BUG01-exato-200.png)

### BUG-01: subtotal de R$ 200,00 com cupom (CT16)
Total R$ 199,90; o esperado era R$ 180,00.
![CT16](evidencias/img/CT16-BUG01-exato-200-cupom.png)

### BUG-02: carrinho com 6 unidades (CT23)
![CT23 carrinho](evidencias/img/CT23-BUG02-carrinho-6-unidades.png)

### BUG-02: pedido com 6 unidades confirmado (CT23)
![CT23 confirmação](evidencias/img/CT23-BUG02-pedido-6-unidades-confirmado.png)

### BUG-02 e BUG-03: evidências de API
Ver [CT21](evidencias/api-log.md#ct21---6-unidades-no-cálculo---bug-02), [CT22](evidencias/api-log.md#ct22---pedido-com-6-unidades---bug-02) e [CT34](evidencias/api-log.md#ct34---item-sem-produtoid---bug-03) no log da API.

### BUG-04: cupom volta sozinho depois de remover o último item (CT59)
| 1. Cupom aplicado | 2. Último item removido | 3. Novo produto: cupom volta sozinho |
|---|---|---|
| ![](evidencias/img/CT59-BUG04-1-cupom-aplicado.png) | ![](evidencias/img/CT59-BUG04-2-carrinho-vazio.png) | ![](evidencias/img/CT59-BUG04-3-cupom-volta-sozinho.png) |

### BUG-05: pedido confirmado com nome "123 456" (CT68)
![CT68](evidencias/img/CT68-BUG05-nome-numerico-confirmado.png)

### BUG-06: e-mail com ".." aceito (CT69)
Ver [CT69](evidencias/api-log.md#ct69---e-mail-com-pontos-seguidos-mariaexemplocom---bug-06) no log da API.

### BUG-07: menu incompleto no celular (CT72)
![CT72](evidencias/img/CT72-BUG07-menu-oculto-celular.png)

---

## Cupom de desconto

| CT01: BEMVINDO10 aplicado | CT02: "  bemvindo10  " |
|---|---|
| ![](evidencias/img/CT01-cupom-valido.png) | ![](evidencias/img/CT02-cupom-minusculo-espacos.png) |

| CT04: cupom inválido | CT05: cupom expirado |
|---|---|
| ![](evidencias/img/CT04-cupom-invalido.png) | ![](evidencias/img/CT05-cupom-expirado.png) |

| CT07: campo vazio | CT09: cupom removido |
|---|---|
| ![](evidencias/img/CT07-cupom-vazio.png) | ![](evidencias/img/CT09-cupom-removido.png) |

## Frete

| CT11: R$ 100,00 | CT12: R$ 199,80 |
|---|---|
| ![](evidencias/img/CT11-abaixo-200.png) | ![](evidencias/img/CT12-199-80.png) |

| CT14: R$ 229,90 | CT15: R$ 219,80 com cupom (frete antes do desconto) |
|---|---|
| ![](evidencias/img/CT14-acima-200.png) | ![](evidencias/img/CT15-frete-antes-do-desconto.png) |

## Quantidade

| CT18: vitrine trava em 5 | CT19: carrinho trava em 5 |
|---|---|
| ![](evidencias/img/CT18-vitrine-limite-5.png) | ![](evidencias/img/CT19-carrinho-limite-5.png) |

## Cálculo

| CT24: exemplo da documentação |
|---|
| ![](evidencias/img/CT24-exemplo-documentacao.png) |

## Checkout

| CT42: checkout preenchido | CT42: pedido confirmado | CT42: carrinho vazio depois do pedido |
|---|---|---|
| ![](evidencias/img/CT42-checkout-preenchido.png) | ![](evidencias/img/CT42-pedido-confirmado.png) | ![](evidencias/img/CT42-carrinho-vazio-apos-pedido.png) |

| CT43: campos vazios | CT44: dados inválidos |
|---|---|
| ![](evidencias/img/CT43-checkout-campos-vazios.png) | ![](evidencias/img/CT44-checkout-dados-invalidos.png) |

| CT45: CEP com 9 dígitos | CT45: CEP com letras | CT47: cupom expirado no checkout |
|---|---|---|
| ![](evidencias/img/CT45-checkout-cep-9-digitos.png) | ![](evidencias/img/CT45-checkout-cep-letras.png) | ![](evidencias/img/CT47-checkout-cupom-expirado.png) |

## Navegação e ambiente

| Vitrine | CT48: nova aba com carrinho vazio | CT49: carrinho esvaziado |
|---|---|---|
| ![](evidencias/img/EV00-vitrine.png) | ![](evidencias/img/CT48-nova-aba-carrinho-vazio.png) | ![](evidencias/img/CT49-esvaziar.png) |

| CT50: confirmação sem pedido | CT51: página inexistente |
|---|---|
| ![](evidencias/img/CT50-confirmacao-sem-pedido.png) | ![](evidencias/img/CT51-pagina-inexistente.png) |

---

## Testes complementares (CT52 a CT72)

Resultado de cada cenário em [05-testes-complementares.md](05-testes-complementares.md).

| CT52: contador com produtos diferentes | CT55: botão reabilita depois de reduzir |
|---|---|
| ![](evidencias/img/CT52-contador-produtos-diferentes.png) | ![](evidencias/img/CT55-vitrine-reabilita-apos-reduzir.png) |

| CT57: com cupom, sobe acima de R$ 200 | CT58: com cupom, desce abaixo de R$ 200 | CT60: "Esvaziar" limpa o cupom |
|---|---|---|
| ![](evidencias/img/CT57-cupom-quantidade-sobe-acima-200.png) | ![](evidencias/img/CT58-cupom-quantidade-desce-abaixo-200.png) | ![](evidencias/img/CT60-esvaziar-limpa-cupom.png) |

| CT64: âncora da documentação | CT66: foco visível pelo teclado |
|---|---|
| ![](evidencias/img/CT64-documentacao-ancora-codigos-erro.png) | ![](evidencias/img/CT66-teclado-foco-e-enter.png) |

| CT65: vitrine no iPhone 12 | CT65: carrinho no iPhone 12 | CT65: checkout no iPhone 12 |
|---|---|---|
| ![](evidencias/img/CT65-mobile-vitrine.png) | ![](evidencias/img/CT65-mobile-carrinho.png) | ![](evidencias/img/CT65-mobile-checkout.png) |

| CT67: pedido confirmado no Firefox | CT67: pedido confirmado no WebKit (Safari) |
|---|---|
| ![](evidencias/img/CT67-firefox-pedido-confirmado.png) | ![](evidencias/img/CT67-webkit-pedido-confirmado.png) |

Tabelas de apoio no log: [CT65, celular](evidencias/api-log.md#ct65---celular-largura-da-página-x-largura-da-tela) e [CT70, formulário x API](evidencias/api-log.md#ct70---validação-do-formulário-x-validação-da-api).

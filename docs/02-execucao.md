# Relatório de execução: VZS-142, cupom de desconto e frete grátis

| | |
|---|---|
| **Card** | VZS-142, versão 2.3.0 (publicado em 30/09/2026) |
| **Ambiente** | https://verzel-store.qa-test-verzel-store.workers.dev |
| **Data da execução** | 09/10/2026 |
| **Navegador** | Chromium (Playwright 1.48), desktop 1280x900 |
| **Executado por** | Brenda Beatriz Maciel da Silva |

## Resumo

Este documento cobre os **critérios de aceite** do card (CT01 a CT51). Os testes **além dos critérios** (CT52 a CT72) estão em [05-testes-complementares.md](05-testes-complementares.md).

| Escopo | Cenários | Passou | Falhou | Bugs |
|---|---|---|---|---|
| Critérios de aceite (este documento) | 51 | 45 | 6 | 3 (BUG-01 a BUG-03) |
| Testes complementares | 21 | 17 | 4 | 4 (BUG-04 a BUG-07) |
| **Total** | **72** | **62** | **10** | **7** ([ver bugs](03-bugs.md)) |

| Critério de aceite | Resultado | Observação |
|---|---|---|
| CA01: BEMVINDO10 dá 10% | ✅ Passou | |
| CA02: maiúsculas/minúsculas e espaços | ✅ Passou | |
| CA03: cupom inexistente | ✅ Passou | |
| CA04: cupom expirado | ✅ Passou | |
| CA05: um cupom por vez | ✅ Passou | |
| CA06: frete grátis a partir de R$ 200,00, **inclusive** | ❌ **Falhou** | [BUG-01](03-bugs.md#bug-01): exatamente R$ 200,00 cobra frete |
| CA07: frete R$ 19,90 e quanto falta | ✅ Passou | Com subtotal de R$ 200,00 aparece "Faltam R$ 0,00" (efeito do BUG-01) |
| CA08: frete grátis considera subtotal antes do desconto | ✅ Passou* | *Passa acima de R$ 200,00; em exatamente R$ 200,00 falha pelo BUG-01 |
| CA09: desconto não incide no frete | ✅ Passou | |
| CA10: máximo de 5 unidades na interface **e na API** | ❌ **Falhou** | Interface ok; [BUG-02](03-bugs.md#bug-02): API aceita qualquer quantidade |
| CA11: arredondamento em 2 casas | ✅ Passou | 40 carrinhos variados sem divergência |

**Recomendação:** o card **não está pronto para produção**. O BUG-01 e o BUG-02 violam critérios de aceite explícitos (CA06 e CA10). O BUG-01 cobra frete de clientes que têm direito ao frete grátis, e a interface ainda informa "Faltam R$ 0,00".

## Como os testes foram executados

- **Manual:** roteiro do cenário seguido pela interface ou com chamadas diretas à API (Node `fetch`), com o resultado conferido contra a documentação.
- **Exploratório:** sessões guiadas por um objetivo (ver a seção [Sessões exploratórias](#sessões-exploratórias)), buscando bordas que a documentação não detalha.
- **Automatizado:** cenário também coberto pela suíte Playwright em [`tests/`](https://github.com/Brwnds/verzel-store-qa/tree/main/tests). Os cenários com bug conhecido estão marcados com `test.fail()` (ver o [README](https://github.com/Brwnds/verzel-store-qa#bugs-conhecidos-na-automação)).

A coluna **Evidência** aponta para o screenshot em [`evidencias/img`](evidencias/img) ou para o trecho do [log da API](evidencias/api-log.md).

## Resultado por cenário

### Cupom de desconto: [01-cupom.feature](https://github.com/Brwnds/verzel-store-qa/blob/main/docs/01-cenarios/01-cupom.feature)

| ID | Cenário | CA | Tipo | Resultado | Evidência |
|---|---|---|---|---|---|
| CT01 | Aplicar BEMVINDO10 (R$ 100,00 → desconto R$ 10,00, total R$ 109,90) | CA01 | Manual + Automatizado | ✅ Passou | [img](evidencias/img/CT01-cupom-valido.png) |
| CT02 | "  bemvindo10  " é aceito | CA02 | Manual + Automatizado | ✅ Passou | [img](evidencias/img/CT02-cupom-minusculo-espacos.png) |
| CT03 | "BemVindo10" é aceito (API) | CA02 | Manual + Automatizado | ✅ Passou | [api-log](evidencias/api-log.md#ct03---cupom-com-letras-misturadas-bemvindo10) |
| CT04 | Cupom inexistente → "Cupom inválido." | CA03 | Manual + Automatizado | ✅ Passou | [img](evidencias/img/CT04-cupom-invalido.png) |
| CT05 | Cupom expirado → "Cupom expirado." | CA04 | Manual + Automatizado | ✅ Passou | [img](evidencias/img/CT05-cupom-expirado.png) |
| CT06 | "verao2026" também é reconhecido como expirado | CA02/CA04 | Manual | ✅ Passou | [api-log](evidencias/api-log.md#ct06---cupom-expirado-em-minúsculas-verao2026) |
| CT07 | Campo vazio → "Informe um cupom." | - | Exploratório | ✅ Passou | [img](evidencias/img/CT07-cupom-vazio.png) |
| CT08 | Com cupom aplicado, o campo some e só há "Remover cupom" | CA05 | Manual + Automatizado | ✅ Passou | [img](evidencias/img/CT01-cupom-valido.png) |
| CT09 | Remover cupom e aplicar outro | CA05 | Manual + Automatizado | ✅ Passou | [img](evidencias/img/CT09-cupom-removido.png) |
| CT10 | "BEM VINDO10", "BEMVINDO", "BEMVINDO100" são inválidos | CA02 | Exploratório | ✅ Passou | [api-log](evidencias/api-log.md#ct10---cupom-com-espaço-no-meio-bem-vindo10) |

### Frete grátis: [02-frete.feature](https://github.com/Brwnds/verzel-store-qa/blob/main/docs/01-cenarios/02-frete.feature)

| ID | Cenário | CA | Tipo | Resultado | Evidência |
|---|---|---|---|---|---|
| CT11 | R$ 100,00 → frete R$ 19,90 e "Faltam R$ 100,00" | CA07 | Manual + Automatizado | ✅ Passou | [img](evidencias/img/CT11-abaixo-200.png) |
| CT12 | R$ 199,80 → frete R$ 19,90 e "Faltam R$ 0,20" | CA07 | Manual + Automatizado | ✅ Passou | [img](evidencias/img/CT12-199-80.png) |
| CT13 | **R$ 200,00 → frete grátis** | CA06 | Manual + Automatizado | ❌ **Falhou ([BUG-01](03-bugs.md#bug-01))** | [img](evidencias/img/CT13-BUG01-exato-200.png) / [api-log](evidencias/api-log.md#ct13---subtotal-exatamente-r-20000-2-x-p005---bug-01) |
| CT14 | R$ 229,90 → frete grátis | CA06 | Manual | ✅ Passou | [img](evidencias/img/CT14-acima-200.png) |
| CT15 | R$ 219,80 com cupom (total R$ 197,82) mantém frete grátis | CA08 | Manual + Automatizado | ✅ Passou | [img](evidencias/img/CT15-frete-antes-do-desconto.png) |
| CT16 | **R$ 200,00 com cupom → frete grátis, total R$ 180,00** | CA06/CA08 | Manual | ❌ **Falhou ([BUG-01](03-bugs.md#bug-01))**: total R$ 199,90 | [img](evidencias/img/CT16-BUG01-exato-200-cupom.png) |
| CT17 | Desconto não incide no frete | CA09 | Manual + Automatizado | ✅ Passou | [api-log](evidencias/api-log.md#ct17---desconto-não-incide-no-frete) |

### Limite de quantidade: [03-quantidade.feature](https://github.com/Brwnds/verzel-store-qa/blob/main/docs/01-cenarios/03-quantidade.feature)

| ID | Cenário | CA | Tipo | Resultado | Evidência |
|---|---|---|---|---|---|
| CT18 | Vitrine desabilita o botão na 5ª unidade | CA10 | Manual + Automatizado | ✅ Passou | [img](evidencias/img/CT18-vitrine-limite-5.png) |
| CT19 | Carrinho: "+" trava em 5 e "-" trava em 1 | CA10 | Manual + Automatizado | ✅ Passou | [img](evidencias/img/CT19-carrinho-limite-5.png) |
| CT20 | API aceita 5 unidades | CA10 | Manual + Automatizado | ✅ Passou | [api-log](evidencias/api-log.md#ct20---5-unidades-limite) |
| CT21 | **API de cálculo recusa 6 e 100 unidades** | CA10 | Manual + Automatizado | ❌ **Falhou ([BUG-02](03-bugs.md#bug-02))** | [api-log](evidencias/api-log.md#ct21---6-unidades-no-cálculo---bug-02) |
| CT22 | **API de pedidos recusa 6 unidades** | CA10 | Manual + Automatizado | ❌ **Falhou ([BUG-02](03-bugs.md#bug-02))** | [api-log](evidencias/api-log.md#ct22---pedido-com-6-unidades---bug-02) |
| CT23 | **Carrinho com 6 unidades não pode ser finalizado** | CA10 | Exploratório | ❌ **Falhou ([BUG-02](03-bugs.md#bug-02))** | [carrinho](evidencias/img/CT23-BUG02-carrinho-6-unidades.png) / [confirmação](evidencias/img/CT23-BUG02-pedido-6-unidades-confirmado.png) |

### Cálculo e arredondamento: [04-calculo.feature](https://github.com/Brwnds/verzel-store-qa/blob/main/docs/01-cenarios/04-calculo.feature)

| ID | Cenário | CA | Tipo | Resultado | Evidência |
|---|---|---|---|---|---|
| CT24 | Exemplo da documentação (239,70 / 23,97 / 215,73) | CA01/CA11 | Manual + Automatizado | ✅ Passou | [img](evidencias/img/CT24-exemplo-documentacao.png) |
| CT25 | 40 carrinhos variados com cupom batem com o cálculo exato | CA11 | Manual | ✅ Passou (0 divergências) | [api-log](evidencias/api-log.md#ct25---ca11-40-carrinhos-com-cupom-comparados-com-cálculo-exato-em-centavos) |
| CT26 | P001 x3 → 17,97 / 181,63; P006 x1 → 2,99 / 46,81 | CA11 | Manual | ✅ Passou | [api-log](evidencias/api-log.md#ct26---arredondamento-p001-x3-com-cupom) |

### Contrato e erros da API: [05-api.feature](https://github.com/Brwnds/verzel-store-qa/blob/main/docs/01-cenarios/05-api.feature)

| ID | Cenário | Tipo | Resultado | Evidência |
|---|---|---|---|---|
| CT27 | GET /api/produtos → 200, 8 produtos com os preços da doc | Manual + Automatizado | ✅ Passou | [api-log](evidencias/api-log.md#ct27---lista-de-produtos) |
| CT28 | GET produto inexistente → 404 PRODUTO_NAO_ENCONTRADO | Manual + Automatizado | ✅ Passou | [api-log](evidencias/api-log.md#ct28---produto-inexistente) |
| CT29 | JSON inválido → 400 JSON_INVALIDO | Manual + Automatizado | ✅ Passou | [api-log](evidencias/api-log.md#ct29---json-inválido) |
| CT30 | Rota inexistente → 404 ROTA_NAO_ENCONTRADA | Manual + Automatizado | ✅ Passou | [api-log](evidencias/api-log.md#ct30---rota-inexistente) |
| CT31 | Método não permitido → 405 METODO_NAO_PERMITIDO | Manual + Automatizado | ✅ Passou | [api-log](evidencias/api-log.md#ct31---método-não-permitido) |
| CT32 | Itens ausentes ou vazios → 422 ITENS_OBRIGATORIOS | Manual + Automatizado | ✅ Passou | [api-log](evidencias/api-log.md#ct32---sem-itens) |
| CT33 | Item que não é objeto → 422 ITEM_INVALIDO | Manual + Automatizado | ✅ Passou | [api-log](evidencias/api-log.md#ct33---item-que-não-é-objeto) |
| CT34 | **Item sem produtoId → 422 ITEM_INVALIDO** | Exploratório + Automatizado | ❌ **Falhou ([BUG-03](03-bugs.md#bug-03))** | [api-log](evidencias/api-log.md#ct34---item-sem-produtoid---bug-03) |
| CT35 | Produto inexistente no item → 422 PRODUTO_NAO_ENCONTRADO | Manual + Automatizado | ✅ Passou | [api-log](evidencias/api-log.md#ct35---produto-inexistente-no-item) |
| CT36 | Produto repetido → 422 ITEM_DUPLICADO | Manual + Automatizado | ✅ Passou | [api-log](evidencias/api-log.md#ct36---item-duplicado) |
| CT37 | Quantidade 0, -1, 1.5, "2" → 422 QUANTIDADE_INVALIDA | Manual + Automatizado | ✅ Passou | [api-log](evidencias/api-log.md#ct37---quantidade-0) |
| CT38 | Cálculo com cupom inválido/expirado → 200 sem desconto | Manual + Automatizado | ✅ Passou | [api-log](evidencias/api-log.md#ct38---cálculo-com-cupom-inválido) |
| CT39 | Pedido com cupom inexistente → 422 CUPOM_INVALIDO | Manual + Automatizado | ✅ Passou | [api-log](evidencias/api-log.md#ct39---pedido-com-cupom-inválido) |
| CT40 | Pedido com cupom expirado → 422 CUPOM_EXPIRADO | Manual + Automatizado | ✅ Passou | [api-log](evidencias/api-log.md#ct40---pedido-com-cupom-expirado) |
| CT41 | Pedido válido → 201, número VZ-000000, CEP normalizado | Manual + Automatizado | ✅ Passou | [api-log](evidencias/api-log.md#ct41---pedido-válido-com-cupom-minúsculo-e-espaços) |

### Checkout: [06-checkout.feature](https://github.com/Brwnds/verzel-store-qa/blob/main/docs/01-cenarios/06-checkout.feature)

| ID | Cenário | Tipo | Resultado | Evidência |
|---|---|---|---|---|
| CT42 | Compra completa com cupom, do início ao fim | Manual + Automatizado | ✅ Passou | [checkout](evidencias/img/CT42-checkout-preenchido.png) / [confirmação](evidencias/img/CT42-pedido-confirmado.png) / [carrinho vazio](evidencias/img/CT42-carrinho-vazio-apos-pedido.png) |
| CT43 | Campos vazios → mensagens, sem chamada à API | Manual + Automatizado | ✅ Passou | [img](evidencias/img/CT43-checkout-campos-vazios.png) |
| CT44 | Nome sem sobrenome, e-mail e CEP inválidos | Manual + Automatizado | ✅ Passou | [img](evidencias/img/CT44-checkout-dados-invalidos.png) / [api-log](evidencias/api-log.md#ct44---pedido-com-dados-de-cliente-inválidos) |
| CT45 | CEP com 9 dígitos e com letras | Manual | ✅ Passou | [9 dígitos](evidencias/img/CT45-checkout-cep-9-digitos.png) / [letras](evidencias/img/CT45-checkout-cep-letras.png) |
| CT46 | CEP só com números é aceito | Manual | ✅ Passou | [api-log](evidencias/api-log.md#ct46---pedido-com-cep-sem-hífen) |
| CT47 | Cupom expirado no checkout bloqueia o pedido | Exploratório | ✅ Passou | [img](evidencias/img/CT47-checkout-cupom-expirado.png) |

### Navegação e ambiente: [07-navegacao-ambiente.feature](https://github.com/Brwnds/verzel-store-qa/blob/main/docs/01-cenarios/07-navegacao-ambiente.feature)

| ID | Cenário | Tipo | Resultado | Evidência |
|---|---|---|---|---|
| CT48 | Carrinho persiste ao recarregar; nova aba começa vazia (esperado pela doc) | Exploratório | ✅ Passou | [img](evidencias/img/CT48-nova-aba-carrinho-vazio.png) |
| CT49 | Remover item e esvaziar carrinho | Manual | ✅ Passou | [img](evidencias/img/CT49-esvaziar.png) |
| CT50 | /pedido-confirmado sem pedido → "Nenhum pedido recente" | Exploratório | ✅ Passou | [img](evidencias/img/CT50-confirmacao-sem-pedido.png) |
| CT51 | Rota inexistente → "Página não encontrada" | Exploratório | ✅ Passou | [img](evidencias/img/CT51-pagina-inexistente.png) |

## Sessões exploratórias

| # | Objetivo (charter) | Duração aprox. | O que encontrei |
|---|---|---|---|
| S1 | Explorar os **valores-limite do frete** (199,50 / 199,80 / 200,00 / 219,80) com e sem cupom, na UI e na API | 20 min | **BUG-01.** 199,50 e 199,80 corretos; 200,00 cobra frete; acima de 200 correto. |
| S2 | Tentar **ultrapassar 5 unidades** por todos os caminhos: vitrine, botões +/-, `sessionStorage` e API direta | 20 min | Interface bloqueia corretamente. **BUG-02:** API aceita 6 e 100; o pedido é confirmado. |
| S3 | Explorar **entradas inesperadas no cupom**: vazio, só espaços, tab/quebra de linha, espaço interno, número, `null`, parcial | 15 min | Tudo coerente: espaços/tab nas pontas são ignorados; espaço interno, parcial e número → "Cupom inválido."; vazio/`null` → sem cupom. |
| S4 | Explorar **payloads malformados** na API: itens sem campos, tipos errados, array no corpo, corpo vazio | 15 min | **BUG-03** (item sem `produtoId`). O restante segue a tabela de erros. |
| S5 | Explorar o **ciclo de vida do pedido**: confirmação, recarregar, voltar ao carrinho, acessar a confirmação direto | 10 min | Carrinho é limpo após o pedido; confirmação sobrevive ao recarregar; sem pedido mostra "Nenhum pedido recente". Sem falhas. |

## Interpretações de pontos ambíguos

Conforme as regras do teste, registro aqui como interpretei o que não estava explícito:

1. **"A partir de R$ 200,00, inclusive" (CA06)** prevalece sobre o comportamento atual. O próprio campo `valorFaltanteFreteGratis` já retorna `0` para R$ 200,00, o que reforça que o valor deveria ter frete grátis.
2. **CA10 "vale para a interface e para a API":** além da API direta, testei o caminho em que a interface recebe uma quantidade inválida (`sessionStorage` alterado). A regra deve ser garantida no back-end, porque a interface pode ser contornada.
3. **Item sem `quantidade`** retorna `QUANTIDADE_INVALIDA` (e não `ITEM_INVALIDO`). Considerei aceitável, porque o erro aponta o campo correto (`itens[0].quantidade`) e a mensagem é útil. Já o item sem `produtoId` vaza "undefined" e foi reportado (BUG-03).
4. **Espaços no meio do cupom** ("BEM VINDO10") não devem ser ignorados: o CA02 fala apenas em "espaços no início e no fim".
5. **"Na primeira compra"**, citado na página inicial, não pode ser verificado, porque não há login nem histórico de pedidos (fora do escopo, conforme "Sobre este ambiente"). O cupom é aceito em qualquer pedido.
6. **Comportamentos de "Sobre este ambiente"** (carrinho por aba, número de pedido fictício, sem e-mail ou estoque) foram verificados apenas para confirmar que funcionam como documentado e **não** foram reportados.

## Observações e sugestões de melhoria (não são bugs)

- **Duas chamadas iguais ao aplicar cupom:** ao clicar em "Aplicar cupom", a interface faz duas requisições idênticas a `POST /api/carrinho/calcular` ([log de rede](evidencias/api-log.md#ct01---requisições-feitas-pela-interface-ao-clicar-uma-vez-em-aplicar-cupom)). O resultado está correto, mas a chamada é redundante.
- **Mensagem "Faltam R$ 0,00 para o frete grátis."** é um sintoma do BUG-01. Ao corrigir o bug, convém garantir que a mensagem só apareça quando o valor faltante for maior que zero.
- **Mensagem do cupom no carrinho:** a API devolve "Cupom aplicado: 10% de desconto nos produtos.", mas a interface mostra "Cupom BEMVINDO10 aplicado.". Ambas são claras; fica como sugestão exibir também o percentual.

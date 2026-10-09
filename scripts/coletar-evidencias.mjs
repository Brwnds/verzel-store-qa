// Gera as evidências da execução em docs/evidencias:
//   - img/*.png      screenshots da interface, um por cenário
//   - api-log.md     requisição e resposta de cada chamada de API, agrupadas por cenário
// Uso: npm run evidencias
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = process.env.BASE_URL ?? 'https://verzel-store.qa-test-verzel-store.workers.dev';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'evidencias');
const IMG = join(RAIZ, 'img');
mkdirSync(IMG, { recursive: true });

const CLIENTE = { nome: 'Maria Silva', email: 'maria@exemplo.com', cep: '01310-100' };

// ---------------------------------------------------------------- API
const log = [];
async function api(ct, titulo, method, path, body, raw = false) {
  const opt = { method, headers: { 'Content-Type': 'application/json' } };
  if (body !== undefined) opt.body = raw ? body : JSON.stringify(body);
  const res = await fetch(BASE + path, opt);
  const texto = await res.text();
  let json; try { json = JSON.parse(texto); } catch { json = texto; }
  log.push({ ct, titulo, method, path, req: opt.body, status: res.status, json });
  return json;
}

async function coletarApi() {
  const C = '/api/carrinho/calcular';
  await api('CT03', 'Cupom com letras misturadas (BemVindo10)', 'POST', C, { itens: [{ produtoId: 'P002', quantidade: 1 }], cupom: 'BemVindo10' });
  await api('CT06', 'Cupom expirado em minúsculas (verao2026)', 'POST', C, { itens: [{ produtoId: 'P002', quantidade: 1 }], cupom: 'verao2026' });
  await api('CT10', 'Cupom com espaço no meio (BEM VINDO10)', 'POST', C, { itens: [{ produtoId: 'P001', quantidade: 1 }], cupom: 'BEM VINDO10' });
  await api('CT10', 'Cupom parcial (BEMVINDO)', 'POST', C, { itens: [{ produtoId: 'P001', quantidade: 1 }], cupom: 'BEMVINDO' });
  await api('CT10', 'Cupom com caractere a mais (BEMVINDO100)', 'POST', C, { itens: [{ produtoId: 'P001', quantidade: 1 }], cupom: 'BEMVINDO100' });
  await api('CT13', 'Subtotal exatamente R$ 200,00 (2 x P005) - BUG-01', 'POST', C, { itens: [{ produtoId: 'P005', quantidade: 2 }] });
  await api('CT13', 'Subtotal exatamente R$ 200,00 (4 x P008) - BUG-01', 'POST', C, { itens: [{ produtoId: 'P008', quantidade: 4 }] });
  await api('CT16', 'Subtotal R$ 200,00 com cupom - BUG-01', 'POST', C, { itens: [{ produtoId: 'P005', quantidade: 2 }], cupom: 'BEMVINDO10' });
  await api('CT17', 'Desconto não incide no frete', 'POST', C, { itens: [{ produtoId: 'P005', quantidade: 1 }], cupom: 'BEMVINDO10' });
  await api('CT20', '5 unidades (limite)', 'POST', C, { itens: [{ produtoId: 'P001', quantidade: 5 }] });
  await api('CT21', '6 unidades no cálculo - BUG-02', 'POST', C, { itens: [{ produtoId: 'P001', quantidade: 6 }] });
  await api('CT21', '100 unidades no cálculo - BUG-02', 'POST', C, { itens: [{ produtoId: 'P001', quantidade: 100 }] });
  await api('CT22', 'Pedido com 6 unidades - BUG-02', 'POST', '/api/pedidos', { cliente: CLIENTE, itens: [{ produtoId: 'P005', quantidade: 6 }] });
  await api('CT24', 'Exemplo da documentação', 'POST', C, { itens: [{ produtoId: 'P002', quantidade: 1 }, { produtoId: 'P004', quantidade: 2 }], cupom: 'BEMVINDO10' });
  await api('CT26', 'Arredondamento: P001 x3 com cupom', 'POST', C, { itens: [{ produtoId: 'P001', quantidade: 3 }], cupom: 'BEMVINDO10' });
  await api('CT26', 'Arredondamento: P006 x1 com cupom', 'POST', C, { itens: [{ produtoId: 'P006', quantidade: 1 }], cupom: 'BEMVINDO10' });
  await api('CT27', 'Lista de produtos', 'GET', '/api/produtos');
  await api('CT28', 'Produto inexistente', 'GET', '/api/produtos/P999');
  await api('CT29', 'JSON inválido', 'POST', C, '{itens:', true);
  await api('CT30', 'Rota inexistente', 'GET', '/api/xyz');
  await api('CT31', 'Método não permitido', 'GET', C);
  await api('CT32', 'Sem itens', 'POST', C, {});
  await api('CT32', 'Itens vazio', 'POST', C, { itens: [] });
  await api('CT33', 'Item que não é objeto', 'POST', C, { itens: ['P001'] });
  await api('CT34', 'Item sem produtoId - BUG-03', 'POST', C, { itens: [{ quantidade: 1 }] });
  await api('CT35', 'Produto inexistente no item', 'POST', C, { itens: [{ produtoId: 'P999', quantidade: 1 }] });
  await api('CT36', 'Item duplicado', 'POST', C, { itens: [{ produtoId: 'P001', quantidade: 1 }, { produtoId: 'P001', quantidade: 1 }] });
  for (const q of [0, -1, 1.5, '2']) await api('CT37', `Quantidade ${JSON.stringify(q)}`, 'POST', C, { itens: [{ produtoId: 'P001', quantidade: q }] });
  await api('CT38', 'Cálculo com cupom inválido', 'POST', C, { itens: [{ produtoId: 'P005', quantidade: 1 }], cupom: 'XPTO' });
  await api('CT38', 'Cálculo com cupom expirado', 'POST', C, { itens: [{ produtoId: 'P005', quantidade: 1 }], cupom: 'VERAO2026' });
  await api('CT39', 'Pedido com cupom inválido', 'POST', '/api/pedidos', { cliente: CLIENTE, itens: [{ produtoId: 'P005', quantidade: 1 }], cupom: 'XPTO' });
  await api('CT40', 'Pedido com cupom expirado', 'POST', '/api/pedidos', { cliente: CLIENTE, itens: [{ produtoId: 'P005', quantidade: 1 }], cupom: 'VERAO2026' });
  await api('CT41', 'Pedido válido com cupom minúsculo e espaços', 'POST', '/api/pedidos', { cliente: CLIENTE, itens: [{ produtoId: 'P005', quantidade: 1 }], cupom: ' bemvindo10 ' });
  await api('CT44', 'Pedido com dados de cliente inválidos', 'POST', '/api/pedidos', { cliente: { nome: 'Maria', email: 'maria@', cep: '0131010' }, itens: [{ produtoId: 'P005', quantidade: 1 }] });
  await api('CT46', 'Pedido com CEP sem hífen', 'POST', '/api/pedidos', { cliente: { ...CLIENTE, cep: '01310100' }, itens: [{ produtoId: 'P005', quantidade: 1 }] });

  // CT25 - CA11: 40 carrinhos pseudoaleatórios (semente fixa) comparados com cálculo exato em centavos
  const precos = { P001: 5990, P002: 13990, P003: 18990, P004: 4990, P005: 10000, P006: 2990, P007: 22990, P008: 5000 };
  let seed = 7; const rnd = n => (seed = (seed * 16807) % 2147483647) % n;
  const linhas = [];
  for (let k = 0; k < 40; k++) {
    const ids = Object.keys(precos).filter(() => rnd(3) === 0); if (!ids.length) ids.push('P001');
    const itens = ids.map(id => ({ produtoId: id, quantidade: 1 + rnd(5) }));
    const sub = itens.reduce((s, i) => s + precos[i.produtoId] * i.quantidade, 0);
    const desc = Math.round(sub / 10); const frete = sub >= 20000 ? 0 : 1990; const total = sub - desc + frete;
    const res = await (await fetch(BASE + C, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ itens, cupom: 'BEMVINDO10' }) })).json();
    const ok = Math.round(res.subtotal * 100) === sub && Math.round(res.desconto * 100) === desc && Math.round(res.total * 100) === total;
    linhas.push(`| ${k + 1} | ${itens.map(i => `${i.produtoId}x${i.quantidade}`).join(' ')} | ${(sub / 100).toFixed(2)} / ${(desc / 100).toFixed(2)} / ${(total / 100).toFixed(2)} | ${res.subtotal} / ${res.desconto} / ${res.total} | ${ok ? 'OK' : 'DIVERGE'} |`);
  }
  return linhas;
}

// ---------------------------------------------------------------- UI
async function contexto(browser, itens, cupom = null) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'pt-BR' });
  if (itens) {
    await ctx.addInitScript(([i, c]) => {
      if (!sessionStorage.getItem('qa:preparado')) {
        sessionStorage.setItem('verzel-store:itens', JSON.stringify(i));
        sessionStorage.setItem('verzel-store:cupom', JSON.stringify(c));
        sessionStorage.setItem('qa:preparado', '1');
      }
    }, [itens, cupom]);
  }
  return ctx;
}
const destacar = (page, sel) => page.locator(sel).first().evaluate(e => { e.style.outline = '3px solid #ff3b3b'; e.style.outlineOffset = '4px'; });
const foto = (page, nome) => page.screenshot({ path: join(IMG, `${nome}.png`), fullPage: true });
// o resumo só existe com o carrinho preenchido; com carrinho vazio não há o que esperar
const esperarResumo = async page => {
  if (await page.locator('.coluna-resumo').count()) await page.locator('.coluna-resumo[aria-busy="false"]').waitFor();
};

async function carrinho(browser, nome, itens, acao, destaque) {
  const ctx = await contexto(browser, itens); const page = await ctx.newPage();
  await page.goto(BASE + '/carrinho', { waitUntil: 'networkidle' }); await esperarResumo(page);
  if (acao) await acao(page);
  await page.waitForLoadState('networkidle'); await esperarResumo(page);
  if (destaque) await destacar(page, destaque);
  await foto(page, nome); await ctx.close();
}
async function aplicar(page, codigo) {
  await page.fill('#campo-cupom', codigo);
  await page.getByRole('button', { name: 'Aplicar cupom' }).click();
  await page.waitForTimeout(700);
}

const rede = [];
async function coletarUi() {
  const browser = await chromium.launch();
  const P005 = [{ produtoId: 'P005', quantidade: 1 }];

  { const ctx = await contexto(browser); const page = await ctx.newPage();
    await page.goto(BASE + '/', { waitUntil: 'networkidle' }); await foto(page, 'EV00-vitrine');
    for (let i = 0; i < 5; i++) { await page.locator('article', { has: page.locator('#nome-P001') }).getByRole('button').click(); await page.waitForTimeout(250); }
    await destacar(page, 'article:has(#nome-P001)');
    await page.screenshot({ path: join(IMG, 'CT18-vitrine-limite-5.png') });
    await page.goto(BASE + '/carrinho', { waitUntil: 'networkidle' }); await esperarResumo(page);
    await destacar(page, '.item-carrinho'); await foto(page, 'CT19-carrinho-limite-5');
    await ctx.close(); }

  await carrinho(browser, 'CT01-cupom-valido', P005, async p => {
    // registra as chamadas que a interface faz ao clicar em "Aplicar cupom"
    p.on('request', r => { if (r.url().includes('/api/') && r.method() === 'POST') rede.push(`POST ${new URL(r.url()).pathname} ${r.postData()}`); });
    await aplicar(p, 'BEMVINDO10');
  }, '.resumo');
  await carrinho(browser, 'CT02-cupom-minusculo-espacos', P005, p => aplicar(p, '  bemvindo10  '), '.resumo');
  await carrinho(browser, 'CT04-cupom-invalido', P005, p => aplicar(p, 'XPTO'), 'form.cupom');
  await carrinho(browser, 'CT05-cupom-expirado', P005, p => aplicar(p, 'VERAO2026'), 'form.cupom');
  await carrinho(browser, 'CT07-cupom-vazio', P005, p => aplicar(p, ''), 'form.cupom');
  await carrinho(browser, 'CT09-cupom-removido', P005, async p => { await aplicar(p, 'BEMVINDO10'); await p.getByRole('button', { name: 'Remover cupom' }).click(); await p.waitForTimeout(700); }, 'form.cupom');
  await carrinho(browser, 'CT11-abaixo-200', P005, null, '.resumo');
  await carrinho(browser, 'CT12-199-80', [{ produtoId: 'P001', quantidade: 1 }, { produtoId: 'P002', quantidade: 1 }], null, '.resumo');
  await carrinho(browser, 'CT13-BUG01-exato-200', [{ produtoId: 'P005', quantidade: 2 }], null, '.resumo');
  await carrinho(browser, 'CT16-BUG01-exato-200-cupom', [{ produtoId: 'P005', quantidade: 2 }], p => aplicar(p, 'BEMVINDO10'), '.resumo');
  await carrinho(browser, 'CT14-acima-200', [{ produtoId: 'P007', quantidade: 1 }], null, '.resumo');
  await carrinho(browser, 'CT15-frete-antes-do-desconto', [{ produtoId: 'P003', quantidade: 1 }, { produtoId: 'P006', quantidade: 1 }], p => aplicar(p, 'BEMVINDO10'), '.resumo');
  await carrinho(browser, 'CT24-exemplo-documentacao', [{ produtoId: 'P002', quantidade: 1 }, { produtoId: 'P004', quantidade: 2 }], p => aplicar(p, 'BEMVINDO10'), '.resumo');
  await carrinho(browser, 'CT49-esvaziar', P005, p => p.getByRole('button', { name: 'Esvaziar carrinho' }).click());

  // CT23 - BUG-02 pela interface: carrinho com 6 unidades (sessionStorage alterado) é confirmado
  { const ctx = await contexto(browser, [{ produtoId: 'P001', quantidade: 6 }]); const page = await ctx.newPage();
    await page.goto(BASE + '/carrinho', { waitUntil: 'networkidle' }); await esperarResumo(page);
    await destacar(page, '.item-carrinho'); await foto(page, 'CT23-BUG02-carrinho-6-unidades');
    await page.goto(BASE + '/checkout', { waitUntil: 'networkidle' });
    await page.fill('#campo-nome', CLIENTE.nome); await page.fill('#campo-email', CLIENTE.email); await page.fill('#campo-cep', CLIENTE.cep);
    await page.getByRole('button', { name: 'Confirmar pedido' }).click(); await page.waitForURL('**/pedido-confirmado');
    await destacar(page, '.resumo, main section'); await foto(page, 'CT23-BUG02-pedido-6-unidades-confirmado');
    await ctx.close(); }

  // Checkout
  { const ctx = await contexto(browser, P005, 'BEMVINDO10'); const page = await ctx.newPage();
    await page.goto(BASE + '/checkout', { waitUntil: 'networkidle' });
    await page.fill('#campo-nome', CLIENTE.nome); await page.fill('#campo-email', CLIENTE.email); await page.fill('#campo-cep', CLIENTE.cep);
    await foto(page, 'CT42-checkout-preenchido');
    await page.getByRole('button', { name: 'Confirmar pedido' }).click(); await page.waitForURL('**/pedido-confirmado'); await page.waitForLoadState('networkidle');
    await foto(page, 'CT42-pedido-confirmado');
    await page.goto(BASE + '/carrinho', { waitUntil: 'networkidle' }); await foto(page, 'CT42-carrinho-vazio-apos-pedido');
    await ctx.close(); }
  const checkout = async (nome, dados, cupom = null) => {
    const ctx = await contexto(browser, P005, cupom); const page = await ctx.newPage();
    await page.goto(BASE + '/checkout', { waitUntil: 'networkidle' });
    if (dados) { await page.fill('#campo-nome', dados.nome); await page.fill('#campo-email', dados.email); await page.fill('#campo-cep', dados.cep); }
    await page.getByRole('button', { name: 'Confirmar pedido' }).click(); await page.waitForTimeout(1200);
    await destacar(page, 'form.formulario'); await foto(page, nome); await ctx.close();
  };
  await checkout('CT43-checkout-campos-vazios', null);
  await checkout('CT44-checkout-dados-invalidos', { nome: 'Maria', email: 'maria@', cep: '0131010' });
  await checkout('CT45-checkout-cep-9-digitos', { ...CLIENTE, cep: '013101000' });
  await checkout('CT45-checkout-cep-letras', { ...CLIENTE, cep: 'abcde-fgh' });
  await checkout('CT47-checkout-cupom-expirado', CLIENTE, 'VERAO2026');

  // Ambiente / navegação
  { const ctx = await contexto(browser); const page = await ctx.newPage();
    await page.goto(BASE + '/pedido-confirmado', { waitUntil: 'networkidle' }); await foto(page, 'CT50-confirmacao-sem-pedido');
    await page.goto(BASE + '/pagina-que-nao-existe', { waitUntil: 'networkidle' }); await foto(page, 'CT51-pagina-inexistente');
    await page.goto(BASE + '/carrinho', { waitUntil: 'networkidle' }); await foto(page, 'CT48-nova-aba-carrinho-vazio');
    await ctx.close(); }

  await browser.close();
}

// ---------------------------------------------------------------- saída
const linhasCa11 = await coletarApi();
await coletarUi();

const blocos = log.map(l => [
  `### ${l.ct} - ${l.titulo}`,
  '',
  `\`${l.method} ${l.path}\``,
  ...(l.req ? ['', '```json', l.req, '```'] : []),
  '',
  `Resposta **${l.status}**`,
  '',
  '```json',
  typeof l.json === 'string' ? l.json : JSON.stringify(l.json, null, 2),
  '```',
  '',
].join('\n'));

writeFileSync(join(RAIZ, 'api-log.md'), [
  '# Log das chamadas de API',
  '',
  `Gerado por \`npm run evidencias\` em ${new Date().toISOString()} contra ${BASE}.`,
  '',
  '## CT25 - CA11: 40 carrinhos com cupom comparados com cálculo exato em centavos',
  '',
  '| # | Itens | Esperado (subtotal / desconto / total) | Obtido | Resultado |',
  '|---|---|---|---|---|',
  ...linhasCa11,
  '',
  '## CT01 - Requisições feitas pela interface ao clicar uma vez em "Aplicar cupom"',
  '',
  '```',
  ...rede,
  '```',
  '',
  '## Chamadas por cenário',
  '',
  ...blocos,
].join('\n'));

console.log(`Evidências geradas em ${RAIZ}`);

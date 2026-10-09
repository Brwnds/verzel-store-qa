import { test, expect, devices } from '@playwright/test';
import { CarrinhoPage, CheckoutPage, VitrinePage, prepararCarrinho } from '../support/pages';

// Funcionalidades da loja além dos critérios de aceite do card VZS-142.

test.describe('Funcionalidades complementares', () => {
  test('CT52 - contador do cabeçalho soma unidades de produtos diferentes', async ({ page }) => {
    const vitrine = new VitrinePage(page);
    await vitrine.abrir();
    await vitrine.adicionar('P001');
    await vitrine.adicionar('P002', 2);
    await vitrine.adicionar('P006');

    await expect(vitrine.contador).toHaveText('4');
    await expect(vitrine.contador).toHaveAttribute('aria-label', '4 itens no carrinho');
    await expect(vitrine.aviso('P002')).toHaveText('2 no carrinho');
  });

  test('CT55 - botão da vitrine volta a habilitar depois de reduzir a quantidade no carrinho', async ({ page }) => {
    await prepararCarrinho(page, [{ produtoId: 'P004', quantidade: 5 }]);
    const carrinho = new CarrinhoPage(page);
    await carrinho.abrir();
    await carrinho.botaoDiminuir('Boné Aba Curva').click();
    await expect(carrinho.quantidade('Boné Aba Curva')).toHaveText('4');

    const vitrine = new VitrinePage(page);
    await vitrine.abrir();
    await expect(vitrine.botaoAdicionar('P004')).toBeEnabled();
    await expect(vitrine.aviso('P004')).toHaveText('4 no carrinho');
  });

  test('CT56 - Enter no campo de cupom aplica o cupom', async ({ page }) => {
    await prepararCarrinho(page, [{ produtoId: 'P005', quantidade: 1 }]);
    const carrinho = new CarrinhoPage(page);
    await carrinho.abrir();

    await carrinho.campoCupom.fill('bemvindo10');
    await carrinho.campoCupom.press('Enter');

    await expect(page.getByText('Cupom BEMVINDO10 aplicado.')).toBeVisible();
    await expect(carrinho.valor('desconto')).toHaveText('- R$ 10,00');
  });

  test('CT57/CT58 - com cupom aplicado, mudar a quantidade recalcula desconto e frete', async ({ page }) => {
    await prepararCarrinho(page, [{ produtoId: 'P002', quantidade: 1 }]);
    const carrinho = new CarrinhoPage(page);
    await carrinho.abrir();
    await carrinho.aplicarCupom('BEMVINDO10');
    await expect(carrinho.valor('total')).toHaveText('R$ 145,81');

    await carrinho.botaoAumentar('Calça Jeans Slim').click(); // R$ 279,80
    await expect(carrinho.valor('desconto')).toHaveText('- R$ 27,98');
    await expect(carrinho.valor('frete')).toHaveText('Grátis');
    await expect(carrinho.valor('total')).toHaveText('R$ 251,82');

    await carrinho.botaoDiminuir('Calça Jeans Slim').click(); // R$ 139,90
    await expect(carrinho.valor('desconto')).toHaveText('- R$ 13,99');
    await expect(carrinho.valor('frete')).toHaveText('R$ 19,90');
    await expect(carrinho.valor('total')).toHaveText('R$ 145,81');
  });

  test('CT59 - remover o último item limpa o cupom, como "Esvaziar carrinho" @BUG-04', async ({ page }) => {
    test.info().annotations.push({ type: 'bug', description: 'BUG-04: cupom continua salvo ao remover o último item e volta aplicado sozinho' });
    test.fail();

    await prepararCarrinho(page, [{ produtoId: 'P005', quantidade: 1 }]);
    const carrinho = new CarrinhoPage(page);
    await carrinho.abrir();
    await carrinho.aplicarCupom('BEMVINDO10');
    await page.getByRole('button', { name: 'Remover Mochila Urbana 20L do carrinho' }).click();
    await expect(page.getByText('Seu carrinho está vazio')).toBeVisible();

    const vitrine = new VitrinePage(page);
    await vitrine.abrir();
    await vitrine.adicionar('P006');
    await carrinho.abrir();

    await expect(carrinho.campoCupom).toBeVisible({ timeout: 3_000 });
    await expect(carrinho.valor('desconto')).toHaveText('R$ 0,00', { timeout: 3_000 });
  });

  test('CT61 - clique duplo em "Confirmar pedido" cria um único pedido', async ({ page }) => {
    await prepararCarrinho(page, [{ produtoId: 'P005', quantidade: 1 }]);
    const checkout = new CheckoutPage(page);
    await checkout.abrir();
    await checkout.preencher({ nome: 'Maria Silva', email: 'maria@exemplo.com', cep: '01310-100' });

    let pedidos = 0;
    page.on('request', r => { if (r.url().endsWith('/api/pedidos')) pedidos++; });
    await page.getByRole('button', { name: 'Confirmar pedido' }).dblclick();

    await expect(page).toHaveURL(/\/pedido-confirmado$/);
    await page.waitForLoadState('networkidle');
    expect(pedidos).toBe(1);
  });

  test('CT62 - checkout acessado com o carrinho vazio redireciona para o carrinho', async ({ page }) => {
    await page.goto('/checkout');
    await expect(page).toHaveURL(/\/carrinho$/);
    await expect(page.getByText('Seu carrinho está vazio')).toBeVisible();
  });

  test('CT53/CT54 - links de navegação levam às páginas certas', async ({ page }) => {
    await page.goto('/');
    const menu = page.getByRole('navigation', { name: 'Principal' });

    await page.getByRole('link', { name: 'Ver as regras da promoção' }).click();
    await expect(page).toHaveURL(/\/documentacao$/);
    await menu.getByRole('link', { name: 'Produtos' }).click();
    await expect(page).toHaveURL(/\/$/);
    await menu.getByRole('link', { name: /Carrinho/ }).click();
    await expect(page).toHaveURL(/\/carrinho$/);
    await page.getByRole('link', { name: 'Ver produtos' }).click();
    await expect(page).toHaveURL(/\/$/);
    await menu.getByRole('link', { name: 'Documentação' }).click();
    await expect(page).toHaveURL(/\/documentacao$/);
    await page.getByRole('link', { name: 'Verzel Store, página inicial' }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('CT64 - menu "Nesta página" da documentação leva a cada seção', async ({ page }) => {
    await page.goto('/documentacao');
    const indice = page.locator('aside.doc-indice');
    for (const [nome, id] of [['História', 'historia'], ['Critérios de aceite', 'criterios'], ['Regras de cálculo', 'regras'],
      ['Dados para teste', 'dados'], ['API', 'api'], ['Códigos de erro', 'erros'], ['Sobre este ambiente', 'ambiente']]) {
      await indice.getByRole('link', { name: nome, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`#${id}$`));
      await expect(page.locator(`#${id}`)).toBeInViewport();
    }
  });
});

test.describe('Celular (iPhone 12)', () => {
  // dimensões, toque e user agent do iPhone 12, mantendo o Chromium do projeto
  const { defaultBrowserType: _ignorado, ...iphone } = devices['iPhone 12'];
  test.use(iphone);

  test('CT65 - páginas não têm rolagem horizontal', async ({ page }) => {
    await prepararCarrinho(page, [{ produtoId: 'P002', quantidade: 1 }, { produtoId: 'P004', quantidade: 2 }]);
    for (const rota of ['/', '/carrinho', '/checkout', '/documentacao']) {
      await page.goto(rota);
      await page.waitForLoadState('networkidle');
      const { largura, conteudo } = await page.evaluate(() => ({ largura: document.documentElement.clientWidth, conteudo: document.documentElement.scrollWidth }));
      expect(conteudo, `rolagem horizontal em ${rota}`).toBeLessThanOrEqual(largura);
    }
  });

  test('CT72 - menu mantém acesso a Produtos e Documentação no celular @BUG-07', async ({ page }) => {
    test.info().annotations.push({ type: 'bug', description: 'BUG-07: no celular os links Produtos e Documentação ficam ocultos e não há menu alternativo' });
    test.fail();
    await page.goto('/carrinho');
    const menu = page.getByRole('navigation', { name: 'Principal' });
    await expect(menu.getByRole('link', { name: 'Produtos' })).toBeVisible({ timeout: 3_000 });
    await expect(menu.getByRole('link', { name: 'Documentação' })).toBeVisible({ timeout: 3_000 });
  });
});

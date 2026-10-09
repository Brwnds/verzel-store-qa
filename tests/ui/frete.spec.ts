import { test, expect } from '@playwright/test';
import { CarrinhoPage, prepararCarrinho } from '../support/pages';

test.describe('Frete grátis no carrinho', () => {
  test('CT11 - abaixo de R$ 200,00 cobra R$ 19,90 e informa quanto falta @CA07', async ({ page }) => {
    await prepararCarrinho(page, [{ produtoId: 'P005', quantidade: 1 }]); // R$ 100,00
    const carrinho = new CarrinhoPage(page);
    await carrinho.abrir();

    await expect(carrinho.valor('frete')).toHaveText('R$ 19,90');
    await expect(carrinho.valor('total')).toHaveText('R$ 119,90');
    await expect(page.getByText('Faltam R$ 100,00 para o frete grátis.')).toBeVisible();
  });

  test('CT12 - R$ 0,10 abaixo do limite (R$ 199,80) ainda cobra frete @CA07', async ({ page }) => {
    await prepararCarrinho(page, [{ produtoId: 'P001', quantidade: 1 }, { produtoId: 'P002', quantidade: 1 }]);
    const carrinho = new CarrinhoPage(page);
    await carrinho.abrir();

    await expect(carrinho.valor('subtotal')).toHaveText('R$ 199,80');
    await expect(carrinho.valor('frete')).toHaveText('R$ 19,90');
    await expect(page.getByText('Faltam R$ 0,20 para o frete grátis.')).toBeVisible();
  });

  test('CT13 - subtotal de exatamente R$ 200,00 tem frete grátis @CA06 @BUG-01', async ({ page }) => {
    test.info().annotations.push({ type: 'bug', description: 'BUG-01: subtotal igual a R$ 200,00 ainda cobra frete de R$ 19,90' });
    test.fail(); // bug conhecido: o teste valida o comportamento ESPERADO e vai "passar" quando o bug for corrigido

    await prepararCarrinho(page, [{ produtoId: 'P005', quantidade: 2 }]); // 2 x R$ 100,00
    const carrinho = new CarrinhoPage(page);
    await carrinho.abrir();

    await expect(carrinho.valor('subtotal')).toHaveText('R$ 200,00');
    await expect(carrinho.valor('frete')).toHaveText('Grátis', { timeout: 3_000 });
    await expect(carrinho.valor('total')).toHaveText('R$ 200,00', { timeout: 3_000 });
  });

  test('CT15 - frete grátis usa o subtotal ANTES do desconto @CA08 @CA09', async ({ page }) => {
    // R$ 189,90 + R$ 29,90 = R$ 219,80; com 10% fica R$ 197,82 (abaixo de 200), mas o frete continua grátis.
    await prepararCarrinho(page, [{ produtoId: 'P003', quantidade: 1 }, { produtoId: 'P006', quantidade: 1 }]);
    const carrinho = new CarrinhoPage(page);
    await carrinho.abrir();
    await carrinho.aplicarCupom('BEMVINDO10');

    await expect(carrinho.valor('subtotal')).toHaveText('R$ 219,80');
    await expect(carrinho.valor('desconto')).toHaveText('- R$ 21,98');
    await expect(carrinho.valor('frete')).toHaveText('Grátis');
    await expect(carrinho.valor('total')).toHaveText('R$ 197,82');
    await expect(page.getByText(/para o frete grátis/)).toHaveCount(0);
  });
});

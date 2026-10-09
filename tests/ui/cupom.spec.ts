import { test, expect } from '@playwright/test';
import { CarrinhoPage, prepararCarrinho } from '../support/pages';

// Mochila Urbana 20L (P005) = R$ 100,00 -> subtotal abaixo do frete grátis, valores fáceis de conferir.
const MOCHILA = [{ produtoId: 'P005', quantidade: 1 }];

test.describe('Cupom de desconto no carrinho', () => {
  let carrinho: CarrinhoPage;

  test.beforeEach(async ({ page }) => {
    await prepararCarrinho(page, MOCHILA);
    carrinho = new CarrinhoPage(page);
    await carrinho.abrir();
  });

  test('CT01 - BEMVINDO10 aplica 10% de desconto sobre o subtotal @CA01', async ({ page }) => {
    await carrinho.aplicarCupom('BEMVINDO10');

    await expect(page.getByText('Cupom BEMVINDO10 aplicado.')).toBeVisible();
    await expect(carrinho.valor('subtotal')).toHaveText('R$ 100,00');
    await expect(carrinho.valor('desconto')).toHaveText('- R$ 10,00');
    await expect(carrinho.valor('frete')).toHaveText('R$ 19,90');
    await expect(carrinho.valor('total')).toHaveText('R$ 109,90');
  });

  test('CT02 - código em minúsculas e com espaços nas pontas é aceito @CA02', async ({ page }) => {
    await carrinho.aplicarCupom('  bemvindo10  ');

    await expect(page.getByText('Cupom BEMVINDO10 aplicado.')).toBeVisible();
    await expect(carrinho.valor('desconto')).toHaveText('- R$ 10,00');
  });

  test('CT04 - cupom inexistente exibe "Cupom inválido." e não dá desconto @CA03', async ({ page }) => {
    await carrinho.aplicarCupom('XPTO');

    await expect(page.getByText('Cupom inválido.', { exact: true })).toBeVisible();
    await expect(carrinho.valor('desconto')).toHaveText('R$ 0,00');
    await expect(carrinho.valor('total')).toHaveText('R$ 119,90');
  });

  test('CT05 - cupom expirado exibe "Cupom expirado." e não dá desconto @CA04', async ({ page }) => {
    await carrinho.aplicarCupom('VERAO2026');

    await expect(page.getByText('Cupom expirado.', { exact: true })).toBeVisible();
    await expect(carrinho.valor('desconto')).toHaveText('R$ 0,00');
    await expect(carrinho.valor('total')).toHaveText('R$ 119,90');
  });

  test('CT08/CT09 - só um cupom por vez: para trocar é preciso remover o atual @CA05', async ({ page }) => {
    await carrinho.aplicarCupom('BEMVINDO10');

    // Com cupom aplicado, o campo some e só existe a opção de remover.
    await expect(carrinho.campoCupom).toHaveCount(0);
    await expect(carrinho.botaoRemoverCupom).toBeVisible();

    await carrinho.botaoRemoverCupom.click();
    await carrinho.aguardarCalculo();
    await expect(carrinho.campoCupom).toBeVisible();
    await expect(carrinho.valor('desconto')).toHaveText('R$ 0,00');

    // Aplica outro cupom depois de remover o primeiro.
    await carrinho.aplicarCupom('VERAO2026');
    await expect(page.getByText('Cupom expirado.', { exact: true })).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';
import { CarrinhoPage, CheckoutPage, VitrinePage, prepararCarrinho } from '../support/pages';

const CLIENTE = { nome: 'Maria Silva', email: 'maria@exemplo.com', cep: '01310-100' };

test.describe('Checkout', () => {
  test('CT42 - compra completa com cupom: vitrine > carrinho > checkout > confirmação', async ({ page }) => {
    const vitrine = new VitrinePage(page);
    await vitrine.abrir();
    await vitrine.adicionar('P005');

    const carrinho = new CarrinhoPage(page);
    await carrinho.abrir();
    await carrinho.aplicarCupom('bemvindo10');
    await carrinho.finalizarCompra();

    const checkout = new CheckoutPage(page);
    await expect(checkout.valor('total')).toHaveText('R$ 109,90');
    await checkout.preencher(CLIENTE);

    const respostaPedido = page.waitForResponse(r => r.url().endsWith('/api/pedidos'));
    await checkout.confirmar();
    const resposta = await respostaPedido;
    expect(resposta.status()).toBe(201);
    const pedido = await resposta.json();

    await expect(page).toHaveURL(/\/pedido-confirmado$/);
    expect(pedido.numero).toMatch(/^VZ-\d{6}$/);
    await expect(page.getByText('Pedido confirmado', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: `Pedido ${pedido.numero}` })).toBeVisible();
    await expect(page.locator('[data-valor="desconto"]')).toHaveText('- R$ 10,00');
    await expect(page.locator('[data-valor="total"]')).toHaveText('R$ 109,90');

    // Depois de confirmar, o carrinho é esvaziado.
    await expect(vitrine.contador).toHaveText('0');
  });

  test('CT43 - campos obrigatórios vazios mostram mensagens e não enviam o pedido', async ({ page }) => {
    await prepararCarrinho(page, [{ produtoId: 'P005', quantidade: 1 }]);
    const checkout = new CheckoutPage(page);
    await checkout.abrir();

    let enviou = false;
    page.on('request', r => { if (r.url().endsWith('/api/pedidos')) enviou = true; });
    await checkout.confirmar();

    await expect(page.getByText('Informe o nome completo.')).toBeVisible();
    await expect(page.getByText('Informe o e-mail.')).toBeVisible();
    await expect(page.getByText('Informe o CEP.')).toBeVisible();
    await expect(page).toHaveURL(/\/checkout$/);
    expect(enviou).toBe(false);
  });

  test('CT44 - nome sem sobrenome, e-mail inválido e CEP com 7 dígitos são recusados', async ({ page }) => {
    await prepararCarrinho(page, [{ produtoId: 'P005', quantidade: 1 }]);
    const checkout = new CheckoutPage(page);
    await checkout.abrir();

    await checkout.preencher({ nome: 'Maria', email: 'maria@', cep: '0131010' });
    await checkout.confirmar();

    await expect(page.getByText('Informe nome e sobrenome.')).toBeVisible();
    await expect(page.getByText('Informe um e-mail válido.')).toBeVisible();
    await expect(page.getByText('Informe um CEP com 8 dígitos.')).toBeVisible();
    await expect(page).toHaveURL(/\/checkout$/);
  });
});

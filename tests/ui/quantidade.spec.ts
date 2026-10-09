import { test, expect } from '@playwright/test';
import { CarrinhoPage, VitrinePage } from '../support/pages';

test.describe('Limite de 5 unidades por produto na interface', () => {
  test('CT18 - vitrine bloqueia o botão ao chegar em 5 unidades @CA10', async ({ page }) => {
    const vitrine = new VitrinePage(page);
    await vitrine.abrir();

    await vitrine.adicionar('P001', 5);

    await expect(vitrine.contador).toHaveText('5');
    await expect(vitrine.aviso('P001')).toHaveText('Limite de 5 unidades atingido.');
    await expect(vitrine.botaoAdicionar('P001')).toBeDisabled();
  });

  test('CT19 - no carrinho o "+" trava em 5 e o "-" trava em 1 @CA10', async ({ page }) => {
    const vitrine = new VitrinePage(page);
    await vitrine.abrir();
    await vitrine.adicionar('P001', 4);

    const carrinho = new CarrinhoPage(page);
    await carrinho.abrir();
    const nome = 'Camiseta Essencial';

    await carrinho.botaoAumentar(nome).click();
    await expect(carrinho.quantidade(nome)).toHaveText('5');
    await expect(carrinho.botaoAumentar(nome)).toBeDisabled();
    await expect(page.getByText('Limite de 5 unidades por produto.')).toBeVisible();
    await expect(carrinho.valor('subtotal')).toHaveText('R$ 299,50');

    for (let q = 4; q >= 1; q--) {
      await carrinho.botaoDiminuir(nome).click();
      await expect(carrinho.quantidade(nome)).toHaveText(String(q));
    }
    await expect(carrinho.botaoDiminuir(nome)).toBeDisabled();
    await carrinho.aguardarCalculo();
    await expect(carrinho.valor('subtotal')).toHaveText('R$ 59,90');
  });
});

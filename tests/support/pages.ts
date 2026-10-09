import { expect, type Page, type Locator } from '@playwright/test';

export type ItemCarrinho = { produtoId: string; quantidade: number };

/**
 * Prepara o carrinho direto no sessionStorage (onde a loja guarda o carrinho da aba).
 * Usado como pré-condição ("Dado que o carrinho tem...") para não repetir cliques na vitrine
 * em todo cenário. O fluxo real de adicionar pela vitrine é coberto em quantidade.spec.ts e checkout.spec.ts.
 */
export async function prepararCarrinho(page: Page, itens: ItemCarrinho[], cupom: string | null = null) {
  await page.addInitScript(([i, c]) => {
    if (!sessionStorage.getItem('qa:preparado')) {
      sessionStorage.setItem('verzel-store:itens', JSON.stringify(i));
      sessionStorage.setItem('verzel-store:cupom', JSON.stringify(c));
      sessionStorage.setItem('qa:preparado', '1');
    }
  }, [itens, cupom] as const);
}

export class VitrinePage {
  constructor(readonly page: Page) {}

  async abrir() {
    await this.page.goto('/');
    await expect(this.page.getByRole('heading', { name: 'Produtos' })).toBeVisible();
  }

  card(produtoId: string): Locator {
    return this.page.locator('article', { has: this.page.locator(`#nome-${produtoId}`) });
  }

  botaoAdicionar(produtoId: string): Locator {
    return this.card(produtoId).getByRole('button', { name: 'Adicionar ao carrinho' });
  }

  aviso(produtoId: string): Locator {
    return this.page.locator(`#aviso-${produtoId}`);
  }

  /** Clica em "Adicionar ao carrinho" e espera o contador do cabeçalho (soma de unidades) subir a cada clique. */
  async adicionar(produtoId: string, vezes = 1) {
    for (let i = 0; i < vezes; i++) {
      const antes = Number(await this.contador.innerText());
      await this.botaoAdicionar(produtoId).click();
      await expect(this.contador).toHaveText(String(antes + 1));
    }
  }

  get contador(): Locator {
    return this.page.locator('.contador-carrinho');
  }
}

export class CarrinhoPage {
  constructor(readonly page: Page) {}

  async abrir() {
    await this.page.goto('/carrinho');
    await expect(this.page.getByRole('heading', { name: 'Carrinho' })).toBeVisible();
    await this.aguardarCalculo();
  }

  async aguardarCalculo() {
    await expect(this.page.locator('.coluna-resumo')).toHaveAttribute('aria-busy', 'false');
  }

  get campoCupom() { return this.page.locator('#campo-cupom'); }
  get botaoAplicar() { return this.page.getByRole('button', { name: 'Aplicar cupom' }); }
  get botaoRemoverCupom() { return this.page.getByRole('button', { name: 'Remover cupom' }); }
  get resumo() { return this.page.locator('.resumo'); }

  valor(nome: 'subtotal' | 'desconto' | 'frete' | 'total'): Locator {
    return this.page.locator(`[data-valor="${nome}"]`);
  }

  async aplicarCupom(codigo: string) {
    await this.campoCupom.fill(codigo);
    const resposta = this.page.waitForResponse(r => r.url().includes('/api/carrinho/calcular') && r.request().method() === 'POST');
    await this.botaoAplicar.click();
    if (codigo.trim()) await resposta;
    await this.aguardarCalculo();
  }

  botaoAumentar(nome: string) { return this.page.getByRole('button', { name: `Aumentar quantidade de ${nome}` }); }
  botaoDiminuir(nome: string) { return this.page.getByRole('button', { name: `Diminuir quantidade de ${nome}` }); }
  quantidade(nome: string) { return this.page.getByRole('group', { name: `Quantidade de ${nome}` }).locator('output'); }

  async finalizarCompra() {
    await this.page.getByRole('link', { name: 'Finalizar compra' }).click();
    await expect(this.page).toHaveURL(/\/checkout$/);
  }
}

export class CheckoutPage {
  constructor(readonly page: Page) {}

  async abrir() {
    await this.page.goto('/checkout');
    await expect(this.page.getByRole('heading', { name: 'Finalizar compra' })).toBeVisible();
  }

  get nome() { return this.page.locator('#campo-nome'); }
  get email() { return this.page.locator('#campo-email'); }
  get cep() { return this.page.locator('#campo-cep'); }
  get formulario() { return this.page.locator('form.formulario'); }

  async preencher(dados: { nome: string; email: string; cep: string }) {
    await this.nome.fill(dados.nome);
    await this.email.fill(dados.email);
    await this.cep.fill(dados.cep);
  }

  async confirmar() {
    await this.page.getByRole('button', { name: 'Confirmar pedido' }).click();
  }

  valor(nome: 'subtotal' | 'desconto' | 'frete' | 'total'): Locator {
    return this.page.locator(`[data-valor="${nome}"]`);
  }
}

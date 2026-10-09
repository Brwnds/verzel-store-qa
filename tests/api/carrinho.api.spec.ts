import { test, expect } from '@playwright/test';

const CALCULAR = '/api/carrinho/calcular';

test.describe('API POST /api/carrinho/calcular', () => {
  test('CT24 - exemplo da documentação: subtotal, desconto, frete e total @CA01 @CA11', async ({ request }) => {
    const res = await request.post(CALCULAR, {
      data: { itens: [{ produtoId: 'P002', quantidade: 1 }, { produtoId: 'P004', quantidade: 2 }], cupom: 'BEMVINDO10' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({
      subtotal: 239.7,
      desconto: 23.97,
      frete: 0,
      freteGratis: true,
      valorFaltanteFreteGratis: 0,
      total: 215.73,
      cupom: { codigo: 'BEMVINDO10', aplicado: true },
    });
  });

  test('CT03 - cupom não diferencia maiúsculas/minúsculas @CA02', async ({ request }) => {
    const res = await request.post(CALCULAR, { data: { itens: [{ produtoId: 'P002', quantidade: 1 }], cupom: 'BemVindo10' } });
    const body = await res.json();
    expect(body.cupom).toMatchObject({ codigo: 'BEMVINDO10', aplicado: true });
    expect(body.desconto).toBe(13.99);
  });

  test('CT38 - cupom inválido/expirado responde 200 sem desconto e com o motivo @CA03 @CA04', async ({ request }) => {
    for (const [cupom, mensagem] of [['XPTO', 'Cupom inválido.'], ['VERAO2026', 'Cupom expirado.']]) {
      const res = await request.post(CALCULAR, { data: { itens: [{ produtoId: 'P005', quantidade: 1 }], cupom } });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.desconto).toBe(0);
      expect(body.total).toBe(119.9);
      expect(body.cupom).toMatchObject({ aplicado: false, mensagem });
    }
  });

  test('CT17 - desconto não incide sobre o frete @CA09', async ({ request }) => {
    const res = await request.post(CALCULAR, { data: { itens: [{ produtoId: 'P005', quantidade: 1 }], cupom: 'BEMVINDO10' } });
    const body = await res.json();
    expect(body).toMatchObject({ subtotal: 100, desconto: 10, frete: 19.9, total: 109.9 });
  });

  test('CT13 - subtotal de exatamente R$ 200,00 tem frete grátis @CA06 @BUG-01', async ({ request }) => {
    test.info().annotations.push({ type: 'bug', description: 'BUG-01: subtotal igual a R$ 200,00 ainda cobra frete de R$ 19,90' });
    test.fail();
    const res = await request.post(CALCULAR, { data: { itens: [{ produtoId: 'P005', quantidade: 2 }] } });
    const body = await res.json();
    expect(body).toMatchObject({ subtotal: 200, frete: 0, freteGratis: true, valorFaltanteFreteGratis: 0, total: 200 });
  });

  test('CT20 - 5 unidades de um produto são aceitas @CA10', async ({ request }) => {
    const res = await request.post(CALCULAR, { data: { itens: [{ produtoId: 'P001', quantidade: 5 }] } });
    expect(res.status()).toBe(200);
    expect((await res.json()).subtotal).toBe(299.5);
  });

  test('CT21 - 6 unidades de um produto são recusadas com QUANTIDADE_MAXIMA_EXCEDIDA @CA10 @BUG-02', async ({ request }) => {
    test.info().annotations.push({ type: 'bug', description: 'BUG-02: API aceita mais de 5 unidades por produto' });
    test.fail();
    const res = await request.post(CALCULAR, { data: { itens: [{ produtoId: 'P001', quantidade: 6 }] } });
    expect(res.status()).toBe(422);
    expect((await res.json()).erro.codigo).toBe('QUANTIDADE_MAXIMA_EXCEDIDA');
  });

  test('CT37 - quantidades 0, -1, 1.5 e "2" são inválidas', async ({ request }) => {
    for (const quantidade of [0, -1, 1.5, '2']) {
      const res = await request.post(CALCULAR, { data: { itens: [{ produtoId: 'P001', quantidade }] } });
      expect(res.status(), `quantidade=${JSON.stringify(quantidade)}`).toBe(422);
      expect((await res.json()).erro).toMatchObject({ codigo: 'QUANTIDADE_INVALIDA', campo: 'itens[0].quantidade' });
    }
  });

  test('CT32/CT33/CT35/CT36 - validações da lista de itens', async ({ request }) => {
    const casos: Array<[unknown, string]> = [
      [{}, 'ITENS_OBRIGATORIOS'],
      [{ itens: [] }, 'ITENS_OBRIGATORIOS'],
      [{ itens: ['P001'] }, 'ITEM_INVALIDO'],
      [{ itens: [{ produtoId: 'P999', quantidade: 1 }] }, 'PRODUTO_NAO_ENCONTRADO'],
      [{ itens: [{ produtoId: 'P001', quantidade: 1 }, { produtoId: 'P001', quantidade: 1 }] }, 'ITEM_DUPLICADO'],
    ];
    for (const [data, codigo] of casos) {
      const res = await request.post(CALCULAR, { data: data as object });
      expect(res.status(), JSON.stringify(data)).toBe(422);
      expect((await res.json()).erro.codigo, JSON.stringify(data)).toBe(codigo);
    }
  });

  test('CT34 - item sem produtoId é tratado como ITEM_INVALIDO @BUG-03', async ({ request }) => {
    test.info().annotations.push({ type: 'bug', description: 'BUG-03: item sem produtoId responde "Produto undefined não encontrado."' });
    test.fail();
    const res = await request.post(CALCULAR, { data: { itens: [{ quantidade: 1 }] } });
    const body = await res.json();
    expect(body.erro.codigo).toBe('ITEM_INVALIDO');
    expect(body.erro.mensagem).not.toContain('undefined');
  });

  test('CT29 - corpo que não é JSON válido responde 400 JSON_INVALIDO', async ({ request }) => {
    const res = await request.post(CALCULAR, { data: '{itens:' });
    expect(res.status()).toBe(400);
    expect((await res.json()).erro.codigo).toBe('JSON_INVALIDO');
  });

  test('CT31 - método não permitido responde 405', async ({ request }) => {
    const res = await request.get(CALCULAR);
    expect(res.status()).toBe(405);
    expect((await res.json()).erro.codigo).toBe('METODO_NAO_PERMITIDO');
  });
});

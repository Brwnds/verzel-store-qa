import { test, expect } from '@playwright/test';

const CLIENTE = { nome: 'Maria Silva', email: 'maria@exemplo.com', cep: '01310-100' };

test.describe('API produtos', () => {
  test('CT27 - lista os 8 produtos com os preços da documentação', async ({ request }) => {
    const res = await request.get('/api/produtos');
    expect(res.status()).toBe(200);
    const precos = Object.fromEntries((await res.json()).map((p: { id: string; preco: number }) => [p.id, p.preco]));
    expect(precos).toEqual({
      P001: 59.9, P002: 139.9, P003: 189.9, P004: 49.9, P005: 100, P006: 29.9, P007: 229.9, P008: 50,
    });
  });

  test('CT28 - produto inexistente responde 404 PRODUTO_NAO_ENCONTRADO', async ({ request }) => {
    const res = await request.get('/api/produtos/P999');
    expect(res.status()).toBe(404);
    expect((await res.json()).erro.codigo).toBe('PRODUTO_NAO_ENCONTRADO');
  });

  test('CT30 - rota inexistente responde 404 ROTA_NAO_ENCONTRADA', async ({ request }) => {
    const res = await request.get('/api/rota-que-nao-existe');
    expect(res.status()).toBe(404);
    expect((await res.json()).erro.codigo).toBe('ROTA_NAO_ENCONTRADA');
  });
});

test.describe('API POST /api/pedidos', () => {
  test('CT41 - pedido válido responde 201 com número VZ-000000 e CEP normalizado', async ({ request }) => {
    const res = await request.post('/api/pedidos', {
      data: { cliente: CLIENTE, itens: [{ produtoId: 'P005', quantidade: 1 }], cupom: ' bemvindo10 ' },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.numero).toMatch(/^VZ-\d{6}$/);
    expect(body.cliente.cep).toBe('01310100');
    expect(body).toMatchObject({ subtotal: 100, desconto: 10, frete: 19.9, total: 109.9 });
  });

  test('CT39/CT40 - cupom inválido ou expirado no pedido responde 422', async ({ request }) => {
    for (const [cupom, codigo] of [['XPTO', 'CUPOM_INVALIDO'], ['VERAO2026', 'CUPOM_EXPIRADO']]) {
      const res = await request.post('/api/pedidos', { data: { cliente: CLIENTE, itens: [{ produtoId: 'P005', quantidade: 1 }], cupom } });
      expect(res.status()).toBe(422);
      expect((await res.json()).erro).toMatchObject({ codigo, campo: 'cupom' });
    }
  });

  test('CT44 - dados do cliente inválidos respondem 422 DADOS_INVALIDOS com detalhes por campo', async ({ request }) => {
    const res = await request.post('/api/pedidos', {
      data: { cliente: { nome: 'Maria', email: 'maria@', cep: '0131010' }, itens: [{ produtoId: 'P005', quantidade: 1 }] },
    });
    expect(res.status()).toBe(422);
    const { erro } = await res.json();
    expect(erro.codigo).toBe('DADOS_INVALIDOS');
    expect(erro.campos.map((c: { campo: string }) => c.campo)).toEqual(['cliente.nome', 'cliente.email', 'cliente.cep']);
  });

  test('CT68 - nome só com números é recusado @BUG-05', async ({ request }) => {
    test.info().annotations.push({ type: 'bug', description: 'BUG-05: nome "123 456" é aceito como nome e sobrenome' });
    test.fail();
    const res = await request.post('/api/pedidos', { data: { cliente: { ...CLIENTE, nome: '123 456' }, itens: [{ produtoId: 'P006', quantidade: 1 }] } });
    expect(res.status()).toBe(422);
  });

  test('CT69 - e-mail com pontos seguidos no domínio é recusado @BUG-06', async ({ request }) => {
    test.info().annotations.push({ type: 'bug', description: 'BUG-06: e-mail "maria@exemplo..com" é aceito' });
    test.fail();
    const res = await request.post('/api/pedidos', { data: { cliente: { ...CLIENTE, email: 'maria@exemplo..com' }, itens: [{ produtoId: 'P006', quantidade: 1 }] } });
    expect(res.status()).toBe(422);
  });

  test('CT22 - pedido com 6 unidades de um produto é recusado @CA10 @BUG-02', async ({ request }) => {
    test.info().annotations.push({ type: 'bug', description: 'BUG-02: API confirma pedido com mais de 5 unidades por produto' });
    test.fail();
    const res = await request.post('/api/pedidos', { data: { cliente: CLIENTE, itens: [{ produtoId: 'P005', quantidade: 6 }] } });
    expect(res.status()).toBe(422);
    expect((await res.json()).erro.codigo).toBe('QUANTIDADE_MAXIMA_EXCEDIDA');
  });
});

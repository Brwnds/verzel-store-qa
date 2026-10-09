# language: pt
# Comportamentos descritos em "Sobre este ambiente": verificados para confirmar que funcionam
# como documentado (não são reportados como bug).

Funcionalidade: Navegação e comportamento do carrinho na aba

  @ui @exploratorio
  Cenário: CT48 - Carrinho fica guardado apenas na aba
    Dado que adicionei produtos ao carrinho
    Quando recarrego a página
    Então os itens continuam no carrinho
    Quando abro a loja em uma nova aba
    Então o carrinho da nova aba está vazio

  @ui @manual
  Cenário: CT49 - Esvaziar carrinho e remover item
    Dado que o carrinho tem "Camiseta Essencial" e "Calça Jeans Slim"
    Quando clico em "Remover" na "Camiseta Essencial"
    Então só a "Calça Jeans Slim" continua e os valores são recalculados
    Quando clico em "Esvaziar carrinho"
    Então vejo "Seu carrinho está vazio"

  @ui @exploratorio
  Cenário: CT50 - Página de confirmação acessada sem pedido
    Quando acesso /pedido-confirmado em uma aba nova
    Então vejo "Nenhum pedido recente"

  @ui @exploratorio
  Cenário: CT51 - Página inexistente
    Quando acesso /pagina-que-nao-existe
    Então vejo "Página não encontrada" com link para os produtos

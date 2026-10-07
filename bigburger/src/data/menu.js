// CARDÁPIO — itens, descrições e preços do cardápio digital oficial (bigrango.saipos.com) e de publicações oficiais.
// Categorias do cardápio oficial: Marmitas, Combos Marmita, Hambúrgueres, Big Xis, Xis Big Mini, Torradas…
// Big Xis: 4 primeiros itens (Big Calabresa e demais seguem no cardápio oficial). Xis Big Mini: 5 itens (o nome do 1º não aparecia na captura: 'Mini Calabresa' é inferido; confirme). Marmitas: 4 primeiros itens da categoria (a lista continua no cardápio oficial). Falta cadastrar aqui as demais categorias/itens (price: null = sem preço confirmado). `from: true` = "A partir de".
import { img } from './images'
export const menu = [
  {
    id: 'hamburgueres',
    name: 'Hambúrgueres',
    items: [
      { name: 'Patriots Cheese', description: 'Pão brioche, hambúrguer de 120g, queijo cheddar, alface, cebola, picles de pepino e maionese da casa.', price: 29.9, from: true, image: img.burgerPicles, order: 'o Patriots Cheese' },
      { name: 'Colts', description: 'Pão brioche, hambúrguer de 120g, queijo cheddar, anéis de cebola empanado, picles de pepino e maionese da casa.', price: 29.9, from: true, image: img.burgerQueijo, order: 'o Colts' },
      { name: 'Giants Bacon', description: 'Pão brioche, hambúrguer de 120g, queijo cheddar, cebola, ketchup, bacon laminado, picles de pepino e maionese da casa.', price: 29.9, from: true, image: img.burgerBacon, order: 'o Giants Bacon' },
      { name: 'Burger Chicken', description: 'Pão brioche, peito de frango empanado, queijo cheddar, alface, tomate, picles de pepino e maionese da casa.', price: 32.9, from: true, image: img.lancheFrango, order: 'o Burger Chicken' },
      { name: 'Burger Básico', description: 'Preço divulgado na promoção do Instagram.', price: 20, image: null, order: 'o Burger Básico' },
    ],
  },
  {
    id: 'marmitas',
    name: 'Marmitas',
    items: [
      { name: 'Iscas de Frango — Monte a Sua', description: 'Iscas de frango grelhados, acompanhados de duas bases e um complemento à sua escolha. Enviamos guardanapo, sal e palito. Média de 550g.', price: 14.9, from: true, image: img.marmitaIscas, order: 'a marmita Iscas de Frango - Monte a Sua' },
      { name: 'Frango à Milanesa — Monte a Sua', description: 'Filé de frango à milanesa, acompanhado de arroz soltinho, feijão e um complemento à sua escolha. Enviamos guardanapo, sal e palito. Média de 550g.', price: 17.9, from: true, image: img.marmitaMilanesa, order: 'a marmita Frango a Milanesa - Monte a Sua' },
      { name: 'Strogonoff de Frango — Monte a Sua', description: 'Pedacinhos de frango macios no cremoso molho de strogonoff do Big Rango, acompanhados de duas bases à sua escolha e batata palha.', price: 17.9, from: true, image: img.marmitaStrogonoff, order: 'a marmita Strogonoff de Frango - Monte a Sua' },
      { name: 'Calabresa Acebolada com Acompanhamento', description: 'Calabresa acebolada, acompanhada de arroz soltinho, feijão e um complemento à sua escolha. Enviamos guardanapo, sal e palito. Média de 550g.', price: 17.9, from: true, image: img.marmitaCalabresa, order: 'a marmita Calabresa Acebolada com Acompanhamento' },
    ],
  },
  {
    id: 'xis',
    name: 'Big Xis',
    items: [
      { name: 'Xis Big Frango', description: 'Pão doce especial, delicioso frango desfiado com tempero da casa, fritas dentro do lanche, ovo chapeado, presunto, queijo mussarela derretido, milho, ervilha fresca, alface, tomate e maionese…', price: 33, from: true, image: img.bigFrango, order: 'o Xis Big Frango' },
      { name: 'Xis Big Carne', description: 'Pão doce especial, exclusivo hambúrguer de 150g com tempero da casa, fritas dentro do lanche, ovo chapeado, presunto, queijo mussarela derretido, milho, ervilha fresca, alface, tomate e maionese…', price: 36, from: true, image: img.bigCarne, order: 'o Xis Big Carne' },
      { name: 'Xis Big Bacon', description: 'Pão doce especial, hambúrguer de 150g com tempero da casa, bacon em cubos bem fritinho, fritas dentro do lanche, ovo chapeado, presunto, queijo mussarela derretido, milho, ervilha fresca, alface…', price: 41.9, from: true, image: img.bigBacon, order: 'o Xis Big Bacon' },
      { name: 'Xis Big Coração', description: 'Pão doce especial, coração chapeado com tempero da casa, fritas dentro do lanche, ovo chapeado, presunto, queijo mussarela derretido, milho, ervilha fresca, alface, tomate e maionese artesanal.', price: 36, from: true, image: img.bigCoracao, order: 'o Xis Big Coração' },
      { name: 'Xis do Big Burger', description: 'O xis da casa: sempre a melhor escolha.', price: null, image: img.xis, order: 'o Xis do Big Burger' },
      { name: 'Xis Salada', description: 'Promoção de sexta, só para consumo no salão.', price: 27, image: null, order: 'o Xis Salada' },
      { name: 'Xis Calabresa', description: 'Promoção de sexta, só para consumo no salão.', price: 27, image: null, order: 'o Xis Calabresa' },
      { name: 'Xis Frango', description: 'Promoção de sexta, só para consumo no salão.', price: 27, image: null, order: 'o Xis Frango' },
      { name: 'Xis Coração', description: 'Promoção de sexta, só para consumo no salão.', price: 27, image: null, order: 'o Xis Coração' },
    ],
  },
  {
    id: 'xis-mini',
    name: 'Xis Big Mini',
    items: [
      { name: 'Mini Calabresa', description: 'Pão mini doce, calabresa chapeada, ovo, presunto, queijo, milho, ervilha fresca, alface, tomate e molho da casa.', price: 27, from: true, image: img.miniCalabresa, order: 'o Mini Calabresa' },
      { name: 'Mini Frango', description: 'Pão mini doce, delicioso frango desfiado com tempero da casa, ovo, presunto, queijo, milho, ervilha fresca, alface, tomate e molho da casa.', price: 27, from: true, image: img.miniFrango, order: 'o Mini Frango' },
      { name: 'Mini Strogonoff de Gado', description: null, price: 36, image: null, order: 'o Mini Strogonoff de Gado' },
      { name: 'Mini Carne', description: 'Pão mini doce, hambúrguer, ovo, presunto, queijo, milho, ervilha fresca, alface, tomate e molho da casa.', price: 29, from: true, image: img.miniCarne, order: 'o Mini Carne' },
      { name: 'Mini Coração', description: 'Pão mini doce, coração chapeado, ovo, presunto, queijo, milho, ervilha fresca, alface, tomate e molho da casa.', price: 30, from: true, image: img.miniCoracao, order: 'o Mini Coração' },
    ],
  },
  {
    id: 'porcoes',
    name: 'Porções',
    items: [
      { name: 'Porção de frango', description: 'Frango crocante com batata frita e molho.', price: null, image: img.porcao, order: 'a Porção de frango' },
    ],
  },
  {
    id: 'pratos',
    name: 'Pratos',
    items: [
      { name: 'Ala minuta', description: 'Comida caseira: arroz, feijão, batata frita e salada.', price: null, image: img.almoco, order: 'a Ala minuta' },
      { name: 'Prato com bife e ovo', description: 'Bife, ovo, batata frita, arroz e feijão.', price: null, image: img.prato, order: 'o Prato com bife e ovo' },
    ],
  },
  {
    id: 'combos',
    name: 'Combos',
    items: [
      { name: 'Combo X Mini + Refri + Batata P', description: 'Preço divulgado no Instagram da Big Burger.', price: 26.9, image: null, order: 'o Combo X Mini + Refri + Batata P' },
    ],
  },
  {
    id: 'bebidas',
    name: 'Bebidas',
    items: [
      { name: 'Quentão', description: 'Servido na caneca.', price: null, image: null, order: 'um Quentão' },
    ],
  },
]

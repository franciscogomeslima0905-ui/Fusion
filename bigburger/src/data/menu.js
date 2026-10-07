// CARDÁPIO — itens, descrições e preços do cardápio digital oficial (bigrango.saipos.com) e de publicações oficiais.
// Categorias do cardápio oficial: Marmitas, Combos Marmita, Hambúrgueres, Big Xis, Xis Big Mini, Torradas…
// Falta cadastrar aqui as demais categorias/itens (price: null = sem preço confirmado). `from: true` = "A partir de".
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
    id: 'xis',
    name: 'Xis',
    items: [
      { name: 'Xis do Big Burger', description: 'O xis da casa: sempre a melhor escolha.', price: null, image: img.xis, order: 'o Xis do Big Burger' },
      { name: 'Xis Salada', description: 'Promoção de sexta, só para consumo no salão.', price: 27, image: null, order: 'o Xis Salada' },
      { name: 'Xis Calabresa', description: 'Promoção de sexta, só para consumo no salão.', price: 27, image: null, order: 'o Xis Calabresa' },
      { name: 'Xis Frango', description: 'Promoção de sexta, só para consumo no salão.', price: 27, image: null, order: 'o Xis Frango' },
      { name: 'Xis Coração', description: 'Promoção de sexta, só para consumo no salão.', price: 27, image: null, order: 'o Xis Coração' },
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

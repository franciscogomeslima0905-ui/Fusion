// Fotos de Xis/Hambúrguer abaixo são ilustrativas (enviadas pelo cliente): troque pelas fotos reais de cada item.
// CARDÁPIO — somente itens e preços confirmados em publicações oficiais da Big Burger.
// O cardápio completo (adicionais, combos, bebidas, sobremesas) fica em bigrango.saipos.com.
// Para completar: adicione itens aqui (name, description, price em reais ou null, image opcional).
import { img } from './images'

export const menu = [
  {
    id: 'xis',
    name: 'Xis',
    items: [
      { name: 'Xis do Big Burger', description: 'O xis da casa: sempre a melhor escolha.', price: null, image: img.xis, order: 'o Xis do Big Burger' },
      { name: 'Xis Salada', description: 'Promoção de sexta, só para consumo no salão.', price: 27, image: img.burgerPicles, order: 'o Xis Salada' },
      { name: 'Xis Calabresa', description: 'Promoção de sexta, só para consumo no salão.', price: 27, image: img.burgerBacon, order: 'o Xis Calabresa' },
      { name: 'Xis Frango', description: 'Promoção de sexta, só para consumo no salão.', price: 27, image: img.lancheFrango, order: 'o Xis Frango' },
      { name: 'Xis Coração', description: 'Promoção de sexta, só para consumo no salão.', price: 27, image: null, order: 'o Xis Coração' },
    ],
  },
  {
    id: 'hamburgueres',
    name: 'Hambúrgueres',
    items: [
      { name: 'Burger Básico', description: 'Preço divulgado na promoção do Instagram.', price: 20, image: img.burgerQueijo, order: 'o Burger Básico' },
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

import cheddarBacon from '../assets/photos/burger-cheddar-bacon.webp'
import onionRings from '../assets/photos/burger-onion-rings.webp'
import molhoCremoso from '../assets/photos/burger-molho-cremoso.webp'
import classico from '../assets/photos/burger-classico.webp'
import capa from '../assets/photos/burger-capa.webp'
import mrWhite from '../assets/photos/burger-mr-white.webp'
import provoleta from '../assets/photos/burger-provoleta.webp'
import gorgonzola from '../assets/photos/burger-gorgonzola.webp'
import caudillho from '../assets/photos/burger-caudillho.webp'
import special from '../assets/photos/burger-special.webp'
import vaoSeOsAneis from '../assets/photos/burger-vao-se-os-aneis.webp'
import americano from '../assets/photos/burger-americano.webp'
import bacon from '../assets/photos/burger-bacon.webp'
import americanoDuplo from '../assets/photos/burger-americano-duplo.webp'
import americanoBacon from '../assets/photos/burger-americano-bacon.webp'
import theBurguer from '../assets/photos/burger-the-burguer.webp'
import mafioso from '../assets/photos/burger-mafioso.webp'
import prime from '../assets/photos/burger-prime.webp'
import domCorleone from '../assets/photos/burger-dom-corleone.webp'
import vivaLasVegas from '../assets/photos/burger-viva-las-vegas.webp'
import classicoCasa from '../assets/photos/burger-classico-casa.webp'
import missOnion from '../assets/photos/burger-miss-onion.webp'
import gouda from '../assets/photos/burger-gouda.webp'
import creamChicken from '../assets/photos/burger-cream-chicken.webp'
import mrBrown from '../assets/photos/burger-mr-brown.webp'

// Nomes, descrições e preços: cardápio oficial (aquele-hamburguer.deliverify.com.br), seção "Novidades".
// Confira os preços antes de publicar — eles mudam no cardápio e aqui são texto fixo.
// Fotos: arquivos enviados pelo estabelecimento (src/assets/photos/). A foto 'mr-white' e 'provoleta'
// tiveram o canto inferior cortado para remover uma marca d'água de ferramenta de imagem.

export interface Product {
  id: string
  title: string
  description: string
  price: string
  image: string
  alt: string
  /** destaque editorial grande (os demais entram na grade) */
  featured?: boolean
  /** posição do recorte (object-position) para enquadrar o hambúrguer */
  focus?: string
}

export const products: Product[] = [
  {
    id: 'mr-white',
    featured: true,
    title: 'Aquele Mr. White',
    description: 'Pão brioche, maionese especial, hambúrguer 150g, queijo cheddar, cebola caramelizada, bacon e barbecue. Acompanha fritas.',
    price: 'R$ 39',
    image: mrWhite,
    alt: 'Aquele Mr. White: hambúrguer com cheddar, bacon, cebola caramelizada e barbecue',
    focus: '50% 55%',
  },
  {
    id: 'provoleta-argentina',
    featured: true,
    title: 'Aquele Provoleta Argentina',
    description: 'Pão brioche, rúcula, maionese especial, hambúrguer 150g, provolone, geleia de frutas rojas com pimenta e bacon.',
    price: 'R$ 43',
    image: provoleta,
    alt: 'Aquele Provoleta Argentina: hambúrguer com provolone derretido, rúcula e geleia de frutas vermelhas',
    focus: '50% 52%',
  },
  {
    id: 'gorgonzola-especial',
    featured: true,
    title: 'Aquele Gorgonzola Especial',
    description: 'Pão brioche, rúcula, maionese especial, hambúrguer 150g, queijo gorgonzola, bacon e cebola caramelizada. Acompanha fritas.',
    price: 'R$ 43',
    image: gorgonzola,
    alt: 'Aquele Gorgonzola Especial: hambúrguer com gorgonzola, bacon e cebola caramelizada no prato da casa',
    focus: '50% 55%',
  },
  {
    id: 'caudillho-da-praia',
    featured: true,
    title: 'Aquele Caudillho da Praia',
    description: 'Pão brioche, rúcula, maionese especial, hambúrguer de 150g, queijo mussarela e salsa criolla. Acompanha fritas.',
    price: 'R$ 38',
    image: caudillho,
    alt: 'Aquele Caudillho da Praia: hambúrguer com mussarela, rúcula e salsa criolla',
    focus: '50% 52%',
  },
  {
    id: 'special-burguer',
    title: 'Aquele Special Burguer',
    description: 'Pão, hambúrguer 150g, rúcula, queijo mussarela, queijo cheddar, bacon, cebola na chapa e maionese especial. Acompanha fritas.',
    price: 'R$ 39',
    image: special,
    alt: 'Aquele Special Burguer: hambúrguer com mussarela, cheddar, bacon e cebola na chapa',
    focus: '50% 50%',
  },
  {
    id: 'vao-se-os-aneis',
    title: 'Aquele Vão-se os anéis',
    description: 'Pão brioche ou salgado, rúcula, tomate, hambúrguer, queijo cheddar, bacon, anel de cebola, geleia de pimenta e maionese da casa.',
    price: 'R$ 39',
    image: vaoSeOsAneis,
    alt: 'Aquele Vão-se os anéis: hambúrguer com cheddar, bacon, anel de cebola e geleia de pimenta',
    focus: '50% 55%',
  },
  {
    id: 'mr-brown',
    title: 'Aquele Mr. Brown',
    description: 'Pão Australiano, hambúrguer 150 gramas, queijo cheddar, cebola caramelizada, bacon, barbecue e maionese especial. Acompanha fritas.',
    price: 'R$ 39',
    image: mrBrown,
    alt: 'Aquele Mr. Brown: hambúrguer no pão australiano com cheddar, bacon e cebola caramelizada',
    focus: '50% 55%',
  },
  {
    id: 'americano',
    title: 'Aquele Americano',
    description: 'Pão, hambúrguer de 150g, queijo mussarela, queijo cheddar, alface, tomate, picles, cebola roxa e maionese especial. Acompanha fritas.',
    price: 'R$ 34',
    image: americano,
    alt: 'Aquele Americano: hambúrguer com cheddar, tomate, cebola roxa, picles e alface',
    focus: '50% 50%',
  },
  {
    id: 'bacon',
    title: 'Aquele Bacon',
    description: 'Pão, hambúrguer de 150g, bacon, queijo mussarela, queijo cheddar e maionese da casa. Acompanha fritas.',
    price: 'R$ 35',
    image: bacon,
    alt: 'Aquele Bacon: hambúrguer com bacon, cheddar e maionese da casa',
    focus: '50% 50%',
  },
  {
    id: 'americano-duplo',
    title: 'Aquele Americano Duplo',
    description: 'Pão, 2 hambúrgueres de 150g, duplo queijo mussarela, duplo queijo cheddar, alface, tomate, picles, cebola roxa e maionese especial.',
    price: 'R$ 44',
    image: americanoDuplo,
    alt: 'Aquele Americano Duplo: dois hambúrgueres com queijo, tomate, cebola roxa e alface',
    focus: '50% 50%',
  },
  {
    id: 'americano-bacon',
    title: 'Aquele Americano com Bacon',
    description: 'Pão, hambúrguer de 150g, bacon, queijo mussarela, queijo cheddar, alface, tomate, picles, cebola roxa e maionese especial. Acompanha fritas.',
    price: 'R$ 39',
    image: americanoBacon,
    alt: 'Aquele Americano com Bacon: hambúrguer com bacon, cheddar, tomate grande e cebola roxa',
    focus: '50% 50%',
  },
  {
    id: 'the-burguer',
    title: 'Aquele The Burguer',
    description: 'Pão, hambúrguer de 150g, duplo queijo mussarela e maionese especial. Acompanha fritas.',
    price: 'R$ 30',
    image: theBurguer,
    alt: 'Aquele The Burguer: hambúrguer com duplo queijo mussarela e maionese especial',
    focus: '50% 50%',
  },
  {
    id: 'mafioso',
    title: 'Aquele Mafioso',
    description: 'Pão brioche, rúcula, maionese especial, hambúrguer 150g, duplo queijo mussarela, tomate seco e cebola crispy. Acompanha fritas.',
    price: 'R$ 36',
    image: mafioso,
    alt: 'Aquele Mafioso: hambúrguer com queijo mussarela, tomate seco e cebola crispy',
    focus: '50% 50%',
  },
  {
    id: 'prime',
    title: 'Aquele Prime',
    description: 'Pão salgado, maionese caseira especial, hambúrguer 150g, queijo cheddar, cebola roxa, barbecue caseiro, bacon e rúcula.',
    price: 'R$ 38',
    image: prime,
    alt: 'Aquele Prime: hambúrguer no pão salgado com bacon, rúcula e barbecue',
    focus: '50% 50%',
  },
  {
    id: 'dom-corleone',
    title: 'Aquele Dom Corleone',
    description: 'Pão, maionese especial, hambúrguer 150g, queijo provolone, tomate cereja confitado e pesto. Acompanha fritas.',
    price: 'R$ 39',
    image: domCorleone,
    alt: 'Aquele Dom Corleone: hambúrguer com provolone derretido, tomate cereja confitado e pesto',
    focus: '50% 50%',
  },
  {
    id: 'viva-las-vegas',
    title: 'Aquele Viva Las Vegas',
    description: 'Pão brioche, hambúrguer, queijo provolone, doce de leite, bacon e geleia argentina de pimenta de frutas vermelhas.',
    price: 'R$ 38',
    image: vivaLasVegas,
    alt: 'Aquele Viva Las Vegas: hambúrguer com provolone, doce de leite, bacon e geleia de pimenta',
    focus: '50% 50%',
  },
  {
    id: 'classico-da-casa',
    title: 'Aquele Clássico',
    description: 'Pão salgado amanteigado, maionese defumada, hambúrguer 150 gramas, queijo mussarela, alface e tomate. Acompanha fritas.',
    price: 'R$ 32',
    image: classicoCasa,
    alt: 'Aquele Clássico: hambúrguer com cheddar, alface e tomate no pão salgado',
    focus: '50% 50%',
  },
  {
    id: 'miss-onion',
    title: 'Aquele Miss Onion',
    description: 'Pão australiano, rúcula, hambúrguer 150g, queijo cheddar, queijo mussarela, bacon, cebola caramelizada e maionese especial. Acompanha fritas.',
    price: 'R$ 39',
    image: missOnion,
    alt: 'Aquele Miss Onion: hambúrguer no pão australiano com bacon e cebola caramelizada',
    focus: '50% 50%',
  },
  {
    id: 'gouda',
    title: 'Aquele Gouda',
    description: 'Pão brioche, maionese especial, rúcula, hambúrguer 150g, queijo cheddar, queijo gouda empanado e molho de mostarda e mel.',
    price: 'R$ 42',
    image: gouda,
    alt: 'Aquele Gouda: hambúrguer com cheddar, queijo gouda empanado e molho de mostarda e mel',
    focus: '50% 50%',
  },
  {
    id: 'cream-chicken',
    title: 'Aquele Cream Chicken Burguer',
    description: 'Pão brioche, maionese caseira especial, rúcula, hambúrguer de frango à milanesa, cream cheese e geleia de pimenta de frutas vermelhas.',
    price: 'R$ 36',
    image: creamChicken,
    alt: 'Aquele Cream Chicken Burguer: frango à milanesa com cream cheese e rúcula no pão brioche',
    focus: '50% 50%',
  },
]

// Recortes do Instagram (baixa resolução) usados na seção do Instagram e como apoio visual.
export const photoCheddar = cheddarBacon
export const photoMolho = molhoCremoso
export const photoClassico = classico
export const photoOnionRings = onionRings
export const photoMrWhite = mrWhite
export const photoCaudillho = caudillho
export const coverPhoto = capa

export interface Category {
  id: string
  title: string
  text: string
  image?: string
  alt?: string
}

// Apenas categorias confirmadas (publicações, avaliações e descrição do perfil).
export const categories: Category[] = [
  {
    id: 'hamburgueres',
    title: 'Hambúrgueres',
    text: 'Artesanais, de carne bem selada e pão macio. Do clássico ao cheddar com bacon.',
    image: capa,
    alt: 'Hambúrguer artesanal do Aquele Hambúrguer',
  },
  {
    id: 'acompanhamentos',
    title: 'Acompanhamentos',
    text: 'Batata frita e onion rings bem sequinhas, do jeito que a avaliação dos clientes conta.',
    image: onionRings,
    alt: 'Hambúrguer com onion rings crocantes',
  },
  {
    id: 'combos',
    title: 'Combos',
    text: 'Promoções do mês no cardápio, como a Promoção 2 Aquele Miss Veggie com guaraná 1,5 lts e fritas (R$ 72). Veja o que está valendo hoje.',
  },
  {
    id: 'bebidas',
    title: 'Bebidas e cervejas',
    text: 'Cervejas especiais, refrigerantes e tudo gelado pra acompanhar.',
  },
]

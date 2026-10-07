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
  /** posição do recorte (object-position) para enquadrar o hambúrguer */
  focus?: string
}

export const products: Product[] = [
  {
    id: 'mr-white',
    title: 'Aquele Mr. White',
    description: 'Pão brioche, maionese especial, hambúrguer 150g, queijo cheddar, cebola caramelizada, bacon e barbecue. Acompanha fritas.',
    price: 'R$ 39',
    image: mrWhite,
    alt: 'Aquele Mr. White: hambúrguer com cheddar, bacon, cebola caramelizada e barbecue',
    focus: '50% 55%',
  },
  {
    id: 'provoleta-argentina',
    title: 'Aquele Provoleta Argentina',
    description: 'Pão brioche, rúcula, maionese especial, hambúrguer 150g, provolone, geleia de frutas rojas com pimenta e bacon.',
    price: 'R$ 43',
    image: provoleta,
    alt: 'Aquele Provoleta Argentina: hambúrguer com provolone derretido, rúcula e geleia de frutas vermelhas',
    focus: '50% 52%',
  },
  {
    id: 'gorgonzola-especial',
    title: 'Aquele Gorgonzola Especial',
    description: 'Pão brioche, rúcula, maionese especial, hambúrguer 150g, queijo gorgonzola, bacon e cebola caramelizada. Acompanha fritas.',
    price: 'R$ 43',
    image: gorgonzola,
    alt: 'Aquele Gorgonzola Especial: hambúrguer com gorgonzola, bacon e cebola caramelizada no prato da casa',
    focus: '50% 55%',
  },
  {
    id: 'caudillho-da-praia',
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

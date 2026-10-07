import cheddarBacon from '../assets/photos/burger-cheddar-bacon.webp'
import onionRings from '../assets/photos/burger-onion-rings.webp'
import molhoCremoso from '../assets/photos/burger-molho-cremoso.webp'
import classico from '../assets/photos/burger-classico.webp'
import capa from '../assets/photos/burger-capa.webp'

// Fotos REAIS recortadas das publicações do Instagram @aquelehamburguer.rs (resolução baixa).
// Substitua por fotos originais em alta em src/assets/photos/ mantendo (ou ajustando) estes imports.
// Nomes e preços: só use o que estiver confirmado no cardápio oficial — por isso aqui os títulos são
// descritivos e NÃO há preços. Troque pelos nomes exatos do cardápio quando quiser.

export interface Product {
  id: string
  title: string
  description: string
  image: string
  alt: string
  /** posição do recorte (object-position) para enquadrar o hambúrguer */
  focus?: string
}

export const products: Product[] = [
  {
    id: 'cheddar-bacon',
    title: 'Cheddar derretido e bacon',
    description: 'Pão macio e brilhante, carne bem selada, cheddar escorrendo e bacon por cima.',
    image: cheddarBacon,
    alt: 'Hambúrguer artesanal com cheddar derretido e bacon sobre uma tábua de madeira',
    focus: '50% 60%',
  },
  {
    id: 'onion-rings',
    title: 'Com onion rings crocantes',
    description: 'Cheddar, folhas verdes e anéis de cebola empanados empilhados no topo da carne.',
    image: onionRings,
    alt: 'Hambúrguer artesanal com onion rings, cheddar e alface',
    focus: '60% 55%',
  },
  {
    id: 'classico',
    title: 'O clássico da casa',
    description: 'Carne, queijo, tomate, cebola roxa, picles e alface fresca no pão de brioche.',
    image: classico,
    alt: 'Hambúrguer artesanal com queijo, tomate, cebola roxa, picles e alface',
    focus: '50% 50%',
  },
  {
    id: 'molho-cremoso',
    title: 'Molho cremoso e cebola roxa',
    description: 'Duas carnes, cheddar, molho cremoso e cebola roxa em um pão bem dourado.',
    image: molhoCremoso,
    alt: 'Hambúrguer artesanal com molho cremoso e cebola roxa',
    focus: '65% 55%',
  },
]

export const coverPhoto = capa
export const photoOnionRings = onionRings
export const photoClassico = classico
export const photoCheddar = cheddarBacon
export const photoMolho = molhoCremoso

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
    text: 'Combos de fim de semana e promoções que mudam toda semana. Veja o que está valendo hoje.',
  },
  {
    id: 'bebidas',
    title: 'Bebidas e cervejas',
    text: 'Cervejas especiais, refrigerantes e tudo gelado pra acompanhar.',
  },
]

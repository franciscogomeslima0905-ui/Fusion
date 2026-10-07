import logo from '../assets/logo.png'
import conjuntoRosa from '../assets/photos/conjunto-rosa.jpg'
import vestidoRosa from '../assets/photos/vestido-rosa.jpg'
import vestidoFloral from '../assets/photos/vestido-floral.jpg'
import blusaZebra from '../assets/photos/blusa-zebra.jpg'
import saiaZebra from '../assets/photos/saia-zebra.jpg'
import tricot from '../assets/photos/tricot.jpg'
import coleteLaranja from '../assets/photos/colete-laranja.jpg'
import shortCouro from '../assets/photos/short-couro.jpg'
import bodies from '../assets/photos/bodies.jpg'
import legging from '../assets/photos/legging.jpg'
import equipe from '../assets/photos/equipe.jpg'

/** Todo o conteúdo editável do site fica aqui. */
export const site = {
  name: 'Deluxe',
  logo,
  storeUrl: 'https://deluxetdai.lojavirtualnuvem.com.br',
  instagramUrl: 'https://www.instagram.com/deluxetdai/',
  instagram: 'deluxetdai',
  /** TROQUE: somente dígitos com DDI + DDD (ex.: 5551999998888). */
  whatsappNumber: '5551000000000',
  whatsappMessage: 'Olá! Vim pelo site da Deluxe e gostaria de falar com a loja.',
  address: 'Av. Atlântica, 1935 - Centro, Tramandaí - RS, 95590-000',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Deluxe+Av.+Atl%C3%A2ntica+1935+Tramanda%C3%AD+RS',
}

export const whatsappLink = `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(site.whatsappMessage)}`

export const photos = {
  conjuntoRosa, vestidoRosa, vestidoFloral, blusaZebra, saiaZebra, tricot,
  coleteLaranja, shortCouro, bodies, legging, equipe,
}

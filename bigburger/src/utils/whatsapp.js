import { restaurant } from '../data/restaurant'

export const waLink = (message) =>
  `https://wa.me/${restaurant.whatsappNumber}?text=${encodeURIComponent(message)}`

export const orderLink = (item) =>
  waLink(`Olá! Vim pelo site da Big Burger e gostaria de pedir ${item}.`)

export const generalOrderLink = () =>
  waLink('Olá! Vim pelo site da Big Burger e gostaria de fazer um pedido.')

// Dados e links reais do estabelecimento — edite aqui para trocar em todo o site.
export const SITE = {
  name: 'Aquele Hambúrguer',
  city: 'Tramandaí',
  street: 'Av. Fernando Amaral, 574',
  district: 'Centro',
  cityState: 'Tramandaí - RS',
  cep: '95590-000',
  phoneDisplay: '(51) 99856-9325',
  phoneTel: '+5551998569325',
  whatsappNumber: '5551998569325',
  menuUrl: 'https://aquele-hamburguer.deliverify.com.br/',
  instagramUrl: 'https://instagram.com/aquelehamburguer.rs/',
  instagramHandle: '@aquelehamburguer.rs',
  rating: '4,7',
  reviewCount: 82,
  priceRange: 'R$ 40–60 por pessoa',
} as const

export const FULL_ADDRESS = 'Av. Fernando Amaral, 574 - Centro, Tramandaí - RS, 95590-000'

export const WHATSAPP_MESSAGE = 'Olá! Vim pelo site do Aquele Hambúrguer e gostaria de fazer um pedido.'

export const whatsappUrl = (message: string = WHATSAPP_MESSAGE) =>
  `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`

export const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(FULL_ADDRESS)}`
export const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(FULL_ADDRESS)}`

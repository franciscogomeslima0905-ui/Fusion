// Todos os dados abaixo vieram dos canais oficiais (Instagram @big_burgertramandai e informações fornecidas pelo dono do projeto).
export const restaurant = {
  name: 'Big Burger',
  slogan: 'Muito sabor',
  address: {
    street: 'R. Sahydi Abrahão, 385',
    district: 'Centro',
    city: 'Tramandaí',
    state: 'RS',
    zip: '95590-000',
    reference: 'Junto ao Hotel Mares do Sul',
  },
  phoneDisplay: '(51) 99393-9449',
  whatsappNumber: '5551993939449',
  instagramHandle: '@big_burgertramandai',
  instagramUrl: 'https://instagram.com/big_burgertramandai/',
  menuUrl: 'https://bigrango.saipos.com',
  rating: 4.5,
  reviews: 1300,
  priceRange: { from: 20, to: 40 },
  // Bio do Instagram: "Estamos abertos todos os dias, das 11:00 à 00:00"
  hours: { open: '11:00', close: '00:00', label: 'Todos os dias, das 11:00 às 00:00' },
}

export const fullAddress = `${restaurant.address.street}, ${restaurant.address.district}, ${restaurant.address.city} - ${restaurant.address.state}, ${restaurant.address.zip}`

export const mapsQuery = `Big Burger, ${fullAddress}`
export const mapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapsQuery)}`
export const mapsPlaceUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`

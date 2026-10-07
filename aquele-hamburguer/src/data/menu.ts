// Demais itens do cardápio oficial (aquele-hamburguer.deliverify.com.br), sem foto na página.
// Quando houver foto de um item, mova-o para `products` em products.ts (com imagem e descrição).
// Confira os preços antes de publicar.
export interface MenuItem { name: string; price: string }
export interface MenuGroup { title: string; items: MenuItem[] }

export const menuGroups: MenuGroup[] = [
  {
    title: 'Hambúrgueres',
    items: [
      { name: 'Aquele Clássico', price: 'R$ 32' },
      { name: 'Aquele Jalapeño', price: 'R$ 38' },
      { name: 'Aquele Miss Onion', price: 'R$ 39' },
      { name: 'Aquele Gorgonzola', price: 'R$ 42' },
      { name: 'Aquele Gouda', price: 'R$ 42' },
      { name: 'Aquele Americano com Bacon Duplo', price: 'R$ 50' },
      { name: 'Aquele Kids', price: 'R$ 24' },
    ],
  },
  {
    title: 'Chicken Burguers',
    items: [
      { name: 'Aquele Cream Chicken Burguer', price: 'R$ 36' },
      { name: 'Aquele American Chicken', price: 'R$ 37' },
      { name: 'Aquele BBK Chicken Burguer', price: 'R$ 39' },
      { name: 'Aquele Gaudillho Chicken Burguer', price: 'R$ 39' },
    ],
  },
]

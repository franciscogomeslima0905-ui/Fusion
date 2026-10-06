/**
 * ============================================================
 *  FUSION GYM — CONFIGURAÇÃO CENTRAL DO SITE
 * ============================================================
 *  Todo o conteúdo editável do site fica neste arquivo:
 *  contato, horários, números, planos, depoimentos e galeria.
 *  Altere aqui e o site inteiro é atualizado.
 * ============================================================
 */

import areaFuncional from '../assets/gallery/area-funcional.webp'
import areaFuncionalSm from '../assets/gallery/area-funcional-sm.webp'
import hackLegPress from '../assets/gallery/hack-leg-press.webp'
import hackLegPressSm from '../assets/gallery/hack-leg-press-sm.webp'
import halteresLuzes from '../assets/gallery/halteres-luzes.webp'
import halteresLuzesSm from '../assets/gallery/halteres-luzes-sm.webp'
import maquinasCimerian from '../assets/gallery/maquinas-cimerian.webp'
import maquinasCimerianSm from '../assets/gallery/maquinas-cimerian-sm.webp'
import salaoPrincipal from '../assets/gallery/salao-principal.webp'
import salaoPrincipalSm from '../assets/gallery/salao-principal-sm.webp'

export const site = {
  name: 'Fusion Gym',
  tagline: 'A sua academia PREMIUM em TRAMANDAÍ!',
  url: 'https://fusiongym.com.br', // ← troque pelo domínio final (usado em SEO / Open Graph)

  contact: {
    /** Somente dígitos, com DDI + DDD. Usado nos links do WhatsApp. */
    whatsappNumber: '5551993482962',
    phoneDisplay: '+55 (51) 99348-2962',
    instagram: 'fusiongymrs',
    instagramUrl: 'https://www.instagram.com/fusiongymrs/',
  },

  address: {
    street: 'Avenida Militão de Almeida, 530',
    city: 'Tramandaí',
    state: 'RS',
    zip: '95590-000',
    country: 'Brasil',
    /**
     * Coordenadas usadas como ponto de partida do mapa.
     * O componente de mapa tenta localizar o endereço exato via Geocoding;
     * se não conseguir, usa estas coordenadas. Confirme-as no Google Maps
     * (clique com o botão direito sobre a academia → copie as coordenadas).
     */
    fallbackCoords: { lat: -29.9846, lng: -50.1336 },
  },
} as const

export const fullAddress = `${site.address.street}, ${site.address.city} - ${site.address.state}, ${site.address.zip}, ${site.address.country}`

/* ------------------------------------------------------------------ */
/*  WHATSAPP — uma mensagem diferente para cada botão                  */
/* ------------------------------------------------------------------ */
export const whatsappMessages = {
  hero: 'Olá! Gostaria de conhecer melhor a Fusion Gym e saber mais sobre os planos.',
  visit: 'Olá! Vim pelo site da Fusion Gym e gostaria de agendar uma visita para conhecer a academia.',
  nav: 'Olá! Vim pelo site da Fusion Gym e gostaria de mais informações.',
  plans: 'Olá! Vim pelo site da Fusion Gym e gostaria de conhecer os planos.',
  plan: (planName: string) => `Olá! Vim pelo site da Fusion Gym e gostaria de saber mais sobre o ${planName}.`,
  structure: 'Olá! Vi a estrutura da Fusion Gym no site e gostaria de conhecer pessoalmente.',
  hours: 'Olá! Vim pelo site da Fusion Gym e tenho uma dúvida sobre os horários.',
  location: 'Olá! Vim pelo site da Fusion Gym e gostaria de ajuda para chegar até a academia.',
  final: 'Olá! Vim pelo site da Fusion Gym e quero começar a treinar. Pode me passar as informações?',
  floating: 'Olá! Vim pelo site da Fusion Gym e gostaria de conhecer os planos.',
} as const

/* ------------------------------------------------------------------ */
/*  HORÁRIOS                                                           */
/*  day: 0 = domingo … 6 = sábado (padrão do JavaScript)               */
/* ------------------------------------------------------------------ */
export type TimeRange = { open: string; close: string }
export type HoursGroup = { id: string; label: string; short: string; days: number[]; ranges: TimeRange[] }

export const hours: HoursGroup[] = [
  { id: 'semana', label: 'Segunda a sexta', short: 'SEG — SEX', days: [1, 2, 3, 4, 5], ranges: [{ open: '05:00', close: '22:00' }] },
  {
    id: 'sabado',
    label: 'Sábado',
    short: 'SÁBADO',
    days: [6],
    ranges: [
      { open: '09:00', close: '13:00' },
      { open: '16:00', close: '20:00' },
    ],
  },
  { id: 'domingo', label: 'Domingo', short: 'DOMINGO', days: [0], ranges: [{ open: '09:00', close: '13:00' }] },
]

/** Fuso horário da academia — o status "aberto agora" é sempre calculado nele. */
export const timeZone = 'America/Sao_Paulo'

/* ------------------------------------------------------------------ */
/*  NÚMEROS — seção "Por que treinar na Fusion?"                       */
/*  Somente dados informados pela academia. Para adicionar um número,  */
/*  inclua um item novo; `value` é animado de 0 até o valor.           */
/* ------------------------------------------------------------------ */
export const stats = [
  { value: 9000, prefix: '+', suffix: '', label: 'seguidores no Instagram', note: '@fusiongymrs' },
  { value: 17, prefix: '', suffix: 'h', label: 'de funcionamento por dia', note: 'de segunda a sexta' },
  { value: 7, prefix: '', suffix: '', label: 'dias por semana abertos', note: 'inclusive fins de semana' },
] as const

export const benefits = [
  {
    title: 'Ambiente premium',
    text: 'Iluminação de LED, piso emborrachado e um salão pensado para você treinar com conforto e foco.',
  },
  {
    title: 'Equipamentos de alto nível',
    text: 'Máquinas guiadas, articuladas e livres para trabalhar cada grupo muscular com precisão e segurança.',
  },
  {
    title: 'Profissionais preparados',
    text: 'Equipe pronta para orientar sua execução, ajustar cargas e acompanhar a sua evolução.',
  },
  {
    title: 'Horários amplos',
    text: 'Das 05h às 22h durante a semana, com horários também aos sábados e domingos.',
  },
] as const

/* ------------------------------------------------------------------ */
/*  PLANOS                                                             */
/*  ⚠️ VALORES E BENEFÍCIOS FICTÍCIOS (provisórios, para apresentação). */
/*  Substitua pelos dados reais da academia antes de publicar.         */
/* ------------------------------------------------------------------ */
export type Plan = {
  id: string
  name: string
  price: string
  period: string
  description: string
  features: string[]
  highlight?: boolean
  badge?: string
}

export const plans: Plan[] = [
  {
    id: 'mensal',
    name: 'Plano Mensal',
    price: 'R$ 149,90',
    period: '/mês',
    description: 'Flexibilidade total para começar agora, sem fidelidade.',
    features: ['Acesso livre à musculação e ao funcional', 'Todos os horários de funcionamento', 'Orientação da equipe no salão', 'Sem fidelidade'],
  },
  {
    id: 'semestral',
    name: 'Plano Semestral',
    price: 'R$ 129,90',
    period: '/mês',
    description: 'O equilíbrio ideal entre economia e compromisso com a sua evolução.',
    features: ['Tudo do Plano Mensal', 'Avaliação física a cada 3 meses', 'Treino personalizado e atualizado', 'Isenção da taxa de matrícula'],
    highlight: true,
    badge: 'Mais escolhido',
  },
  {
    id: 'anual',
    name: 'Plano Anual',
    price: 'R$ 109,90',
    period: '/mês',
    description: 'O melhor custo-benefício para quem quer resultado de verdade.',
    features: ['Tudo do Plano Semestral', 'Avaliação física a cada 2 meses', '1 mês de congelamento por ano', 'Desconto em parceiros Fusion'],
    badge: 'Melhor custo-benefício',
  },
]

/* ------------------------------------------------------------------ */
/*  DEPOIMENTOS                                                        */
/*  ⚠️ AVALIAÇÕES FICTÍCIAS (provisórias, para apresentação).          */
/*  Antes de publicar, troque por avaliações reais de alunos (com      */
/*  autorização) — publicar avaliações inventadas como se fossem reais */
/*  é propaganda enganosa (Código de Defesa do Consumidor).            */
/*  `placeholder: true` marca os itens fictícios; com `showPlaceholderBadge` */
/*  ligado, o card exibe o selo "Exemplo".                             */
/* ------------------------------------------------------------------ */
export type Testimonial = { quote: string; name: string; detail: string; rating: 1 | 2 | 3 | 4 | 5; placeholder: boolean }

export const showPlaceholderBadge = false

export const testimonials: Testimonial[] = [
  {
    quote: 'Melhor academia que já treinei em Tramandaí. Equipamentos novos, ambiente climatizado e uma iluminação que dá vontade de treinar todos os dias.',
    name: 'Camila Rodrigues',
    detail: 'Aluna há 1 ano',
    rating: 5,
    placeholder: true,
  },
  {
    quote: 'Treino às 5h antes do trabalho e a academia sempre está impecável. A equipe corrige a execução e acompanha a evolução de perto.',
    name: 'Rafael Martins',
    detail: 'Aluno há 2 anos',
    rating: 5,
    placeholder: true,
  },
  {
    quote: 'Comecei do zero e me senti acolhida desde o primeiro dia. Em seis meses perdi 9 kg e ganhei muita disposição.',
    name: 'Juliana Souza',
    detail: 'Aluna há 8 meses',
    rating: 5,
    placeholder: true,
  },
  {
    quote: 'As máquinas articuladas fazem toda a diferença no treino de pernas. Estrutura de cidade grande aqui no litoral. Recomendo demais!',
    name: 'Diego Almeida',
    detail: 'Aluno há 1 ano e meio',
    rating: 5,
    placeholder: true,
  },
  {
    quote: 'Ambiente top, música boa e horários que cabem na rotina — inclusive no fim de semana. Virou meu lugar favorito da cidade.',
    name: 'Fernanda Lima',
    detail: 'Aluna há 6 meses',
    rating: 5,
    placeholder: true,
  },
]

/* ------------------------------------------------------------------ */
/*  GALERIA / ESTRUTURA — fotos da academia                            */
/*  Para adicionar fotos: coloque o arquivo em src/assets/gallery/,    */
/*  importe acima e inclua um item na lista.                           */
/* ------------------------------------------------------------------ */
export type Photo = { src: string; srcSm: string; alt: string; title: string; width: number; height: number }

export const photos: Record<'salao' | 'halteres' | 'maquinas' | 'funcional' | 'hack', Photo> = {
  salao: { src: salaoPrincipal, srcSm: salaoPrincipalSm, alt: 'Salão principal da Fusion Gym com máquinas Cimerian e luminárias hexagonais de LED', title: 'Salão principal', width: 960, height: 1219 },
  halteres: { src: halteresLuzes, srcSm: halteresLuzesSm, alt: 'Área de halteres e bancos sob as luminárias hexagonais da Fusion Gym', title: 'Pesos livres', width: 960, height: 1673 },
  maquinas: { src: maquinasCimerian, srcSm: maquinasCimerianSm, alt: 'Linha de máquinas Cimerian para membros inferiores com detalhes em LED vermelho', title: 'Máquinas guiadas', width: 960, height: 1657 },
  funcional: { src: areaFuncional, srcSm: areaFuncionalSm, alt: 'Área funcional com espaldar, bolas suíças, crossover e grama sintética', title: 'Área funcional', width: 960, height: 1650 },
  hack: { src: hackLegPress, srcSm: hackLegPressSm, alt: 'Máquinas articuladas de hack e leg press sob a iluminação de LED', title: 'Máquinas articuladas', width: 914, height: 1607 },
}

export const gallery: Photo[] = [photos.salao, photos.maquinas, photos.halteres, photos.funcional, photos.hack]

export const structure = [
  { photo: photos.salao, index: '01', title: 'Ambiente moderno', text: 'Um salão amplo, climatizado e iluminado por luminárias hexagonais de LED.' },
  { photo: photos.halteres, index: '02', title: 'Pesos livres', text: 'Halteres, anilhas e bancos para treinos de força sem fila e sem improviso.' },
  { photo: photos.maquinas, index: '03', title: 'Musculação', text: 'Máquinas Cimerian guiadas e articuladas para cada grupo muscular.' },
  { photo: photos.funcional, index: '04', title: 'Funcional e mobilidade', text: 'Espaldar, crossover, bolas e área de grama para aquecimento e treinos funcionais.' },
  { photo: photos.hack, index: '05', title: 'Treino de pernas', text: 'Hack, leg press e máquinas articuladas para um treino de inferiores completo.' },
] as const

export const navLinks = [
  { href: '#sobre', label: 'Sobre' },
  { href: '#estrutura', label: 'Estrutura' },
  { href: '#planos', label: 'Planos' },
  { href: '#galeria', label: 'Galeria' },
  { href: '#localizacao', label: 'Localização' },
] as const

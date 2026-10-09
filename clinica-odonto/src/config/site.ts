/**
 * ============================================================
 *  CLÍNICA ODONTOLÓGICA — CONFIGURAÇÃO CENTRAL DO SITE
 * ============================================================
 *  Todo o conteúdo editável fica aqui: nome, contato, horários,
 *  serviços, números, depoimentos e artigos.
 *
 *  IMAGENS: não é preciso mexer em código. Coloque os arquivos em
 *  src/assets/images/ com os nomes indicados em `image` (extensão
 *  .jpg, .jpeg, .png, .webp ou .avif). Enquanto o arquivo não existir,
 *  a página mostra um espaço reservado.
 *
 *  ⚠️ Itens marcados com "PROVISÓRIO" são exemplos — troque pelos
 *  dados reais da clínica antes de publicar.
 * ============================================================
 */

export const site = {
  name: 'Dental Hub', // PROVISÓRIO — nome da clínica
  tagline: 'Odontologia de excelência com tecnologia avançada.',

  contact: {
    /** Somente dígitos, com DDI + DDD. PROVISÓRIO — usado nos botões de agendamento (WhatsApp). */
    whatsappNumber: '5500000000000',
    phoneDisplay: '(00) 00000-0000',
    email: 'contato@suaclinica.com.br',
    instagram: 'suaclinica',
    instagramUrl: 'https://www.instagram.com/',
  },

  address: {
    street: 'Rua Exemplo, 123 — Centro',
    city: 'Sua Cidade',
    state: 'UF',
    zip: '00000-000',
  },

  /** Responsável técnico (exigido em publicidade odontológica pelo CFO). PROVISÓRIO. */
  responsible: 'Dra. Nome Sobrenome — CRO-UF 00000',
} as const

export const hours = {
  label: 'Horário de atendimento',
  lines: ['Seg – Sáb: 10h às 20h', 'Domingo: fechado'],
} as const

export const whatsappMessages = {
  booking: 'Olá! Gostaria de agendar uma avaliação.',
  free: 'Olá! Gostaria de agendar minha consulta gratuita.',
  service: (name: string) => `Olá! Gostaria de saber mais sobre ${name}.`,
} as const

export const nav = [
  { label: 'Início', href: '#inicio' },
  { label: 'Serviços', href: '#servicos' },
  { label: 'Sobre', href: '#diferenciais' },
  { label: 'Depoimentos', href: '#depoimentos' },
  { label: 'Dicas', href: '#dicas' },
  { label: 'Galeria', href: '#galeria' },
] as const

export const features = [
  { icon: 'tooth', title: 'Tecnologia avançada', text: 'Equipamentos modernos para tratamentos precisos e sem dor.' },
  { icon: 'users', title: 'Dentistas especialistas', text: 'Profissionais altamente qualificados e com anos de experiência.' },
  { icon: 'heart', title: 'Foco no conforto', text: 'Ambiente acolhedor, pensado para o seu bem-estar.' },
  { icon: 'wallet', title: 'Cuidado acessível', text: 'Atendimento premium com condições que cabem no seu orçamento.' },
] as const

export const services = [
  { title: 'Clínica geral', text: 'Check-ups, limpezas e cuidados preventivos.', image: 'servico-clinica-geral' },
  { title: 'Odontologia estética', text: 'Clareamento, lentes e design do sorriso.', image: 'servico-estetica' },
  { title: 'Implantes dentários', text: 'Solução definitiva para dentes ausentes.', image: 'servico-implantes' },
  { title: 'Ortodontia', text: 'Aparelhos e alinhadores para um sorriso perfeito.', image: 'servico-ortodontia' },
] as const

/** PROVISÓRIO — confirme os números reais antes de publicar. */
export const stats = [
  { icon: 'award', value: 10, suffix: '+', label: 'Anos de experiência' },
  { icon: 'smile', value: 1000, suffix: '+', label: 'Pacientes felizes', format: true },
  { icon: 'tools', value: 20, suffix: '+', label: 'Especialistas' },
  { icon: 'heart', value: 98, suffix: '%', label: 'Taxa de sucesso' },
] as const

/**
 * PROVISÓRIO — depoimentos de exemplo. Antes de publicar, troque por avaliações
 * reais, com autorização dos pacientes (e respeitando as regras do CFO sobre
 * publicidade). Divulgar depoimentos inventados como reais é propaganda enganosa.
 */
export const testimonials = [
  { quote: 'A melhor experiência odontológica que já tive. A equipe é simpática e muito profissional.', name: 'Ana Souza' },
  { quote: 'Meu sorriso nunca esteve tão bonito. Recomendo de olhos fechados!', name: 'Carlos Lima' },
  { quote: 'Ambiente limpo, tecnologia moderna e um atendimento incrível do início ao fim.', name: 'Marina Alves' },
] as const

/** PROVISÓRIO — títulos e datas de exemplo. */
export const articles = [
  { date: '05 mai 2025', category: 'Cuidados bucais', title: '5 dicas para manter os dentes saudáveis', image: 'dica-1' },
  { date: '28 abr 2025', category: 'Estética', title: 'Clareamento dental: tudo o que você precisa saber', image: 'dica-2' },
  { date: '20 abr 2025', category: 'Implantes', title: 'Implantes ou pontes: qual a melhor opção?', image: 'dica-3' },
] as const

export const gallery = [
  { image: 'galeria-1', alt: 'Paciente sorrindo' },
  { image: 'galeria-2', alt: 'Resultado de clareamento dental' },
  { image: 'galeria-3', alt: 'Dentista atendendo paciente' },
  { image: 'galeria-4', alt: 'Antes e depois de tratamento estético' },
  { image: 'galeria-5', alt: 'Paciente satisfeita com o novo sorriso' },
] as const

/** Arquivos esperados em src/assets/images/ (sem a extensão). */
export const imageSlots = {
  logo: 'logo',
  hero: 'hero',
  doctor: 'doutor',
} as const

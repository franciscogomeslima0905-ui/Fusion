import duplaEscudo from '../assets/photos/dupla-escudo.webp'
import equipeCopa from '../assets/photos/equipe-copa.webp'
import equipeTrofeus from '../assets/photos/equipe-trofeus.webp'
import treinadora from '../assets/photos/treinadora.webp'
import turmaGrande from '../assets/photos/turma-grande.webp'
import comemoracao from '../assets/photos/comemoracao.webp'
import drible from '../assets/photos/drible.webp'
import duelo from '../assets/photos/duelo.webp'
import salto from '../assets/photos/salto.webp'
import turmaBandeira from '../assets/photos/turma-bandeira.webp'
import alunoChute from '../assets/photos/aluno-chute.webp'
import alunoTreinador from '../assets/photos/aluno-treinador.webp'
import cones from '../assets/photos/cones.webp'
import equipe from '../assets/photos/equipe.webp'
import placa from '../assets/photos/placa.webp'
import prancheta from '../assets/photos/prancheta.webp'
import quadraFutsal from '../assets/photos/quadra-futsal.webp'
import quadraTreino from '../assets/photos/quadra-treino.webp'
import treinadorBola from '../assets/photos/treinador-bola.webp'
import treinadorCampo from '../assets/photos/treinador-campo.webp'
import treinadorGrupo from '../assets/photos/treinador-grupo.webp'
import treinoGrama from '../assets/photos/treino-grama.webp'
import turmaTrofeu from '../assets/photos/turma-trofeu.webp'

/**
 * Dados oficiais da escola — só entra aqui o que foi confirmado.
 * Não há endereço, horário, mensalidade ou parceria publicados: não invente.
 */
export const site = {
  name: 'Escola Grêmio Tramandaí e Capão da Canoa',
  short: 'Escola Grêmio',
  whatsappNumber: '555192405499', // DDI 55 + DDD 51 + 9240-5499
  whatsappDisplay: '+55 51 9240-5499',
  instagramUrl: 'https://www.instagram.com/gremiotramandai_capao/',
  instagramHandle: '@gremiotramandai_capao',
  ages: { from: 3, to: 15 },
  years: 15,
} as const

export function whatsappLink(message: string) {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`
}

/** Mensagens pré-preenchidas, uma por contexto. */
export const messages = {
  hero: 'Olá! Conheci a Escola Grêmio Tramandaí e Capão da Canoa pelo site e gostaria de agendar uma aula experimental.',
  header: 'Olá! Gostaria de agendar uma aula experimental na Escola Grêmio.',
  floating: 'Olá! Vim pelo site da Escola Grêmio e gostaria de mais informações.',
  categories: 'Olá! Gostaria de saber mais sobre as turmas da Escola Grêmio para a idade do meu filho(a).',
  training: 'Olá! Vi os treinamentos no site e gostaria de conhecer a Escola Grêmio. Posso agendar uma aula experimental?',
  tramandai: 'Olá! Gostaria de conhecer a unidade de Tramandaí da Escola Grêmio e agendar uma aula experimental.',
  capao: 'Olá! Gostaria de conhecer a unidade de Capão da Canoa da Escola Grêmio e agendar uma aula experimental.',
  final: 'Olá! Gostaria de agendar uma aula experimental na Escola Grêmio Tramandaí e Capão da Canoa.',
} as const

export const nav = [
  { label: 'Início', href: '#inicio' },
  { label: 'A escola', href: '#escola' },
  { label: 'Categorias', href: '#categorias' },
  { label: 'Treinamentos', href: '#treinamentos' },
  { label: 'Contato', href: '#contato' },
] as const

export type Photo = { src: string; alt: string; w: number; h: number }
const p = (src: string, alt: string, w = 262, h = 312): Photo => ({ src, alt, w, h })

/**
 * Fotos de arquivo: recortes dos prints do Instagram da escola (baixa resolução).
 * Para trocar pelas originais, substitua os arquivos em src/assets/photos mantendo os nomes
 * (a proporção pode mudar — os componentes usam object-cover).
 */
export const photos = {
  turmaGrande: p(turmaGrande, 'Turma numerosa de alunos de uniforme tricolor reunida no campo', 725, 450),
  treinadora: p(treinadora, 'Treinadora anotando em uma prancheta cercada por alunos ao ar livre', 542, 695),
  equipeTrofeus: p(equipeTrofeus, 'Equipe de alunos com medalhas e troféus ao lado dos treinadores, no ginásio', 725, 450),
  equipeCopa: p(equipeCopa, 'Equipe de atletas mais velhos com troféus diante do banner da Copa Libertadores', 725, 695),
  duplaEscudo: p(duplaEscudo, 'Dois alunos abraçados diante do escudo do Grêmio', 542, 695),
  drible: p(drible, 'Aluno de colete roxo conduzindo a bola durante o jogo', 542, 695),
  salto: p(salto, 'Aluno saltando durante uma partida no ginásio', 542, 695),
  comemoracao: p(comemoracao, 'Aluno comemorando com os colegas durante o jogo', 542, 695),
  duelo: p(duelo, 'Dois alunos disputando a bola no campo de grama sintética', 542, 695),
  turmaBandeira: p(turmaBandeira, 'Alunos de uniforme tricolor posando em fila diante da bandeira do Grêmio', 725, 514),
  chute: p(alunoChute, 'Aluno da escola finalizando a gol, com uniforme preto e azul', 543, 689),
  alunoTreinador: p(alunoTreinador, 'Treinador acompanhando um aluno em exercício com a bola'),
  cones: p(cones, 'Alunos em atividade com cones no campo de grama sintética'),
  equipe: p(equipe, 'Integrantes da equipe em frente à logomarca da Escola Grêmio'),
  placa: p(placa, 'Treinador apontando para a fachada da escola: Aqui que tudo começa'),
  prancheta: p(prancheta, 'Treinador explicando uma jogada em prancheta tática para os alunos'),
  quadraFutsal: p(quadraFutsal, 'Ginásio com quadra de futsal durante um treino'),
  quadraTreino: p(quadraTreino, 'Treino em quadra com alunos e treinador'),
  treinadorBola: p(treinadorBola, 'Treinador da escola segurando uma bola na quadra'),
  treinadorCampo: p(treinadorCampo, 'Treinador orientando atividade no campo de grama sintética'),
  treinadorGrupo: p(treinadorGrupo, 'Treinador conversando com alunos de uniforme tricolor no campo'),
  treinoGrama: p(treinoGrama, 'Alunos em atividade coletiva no campo de grama sintética'),
  turmaTrofeu: p(turmaTrofeu, 'Turma de alunos reunida com troféu e bandeira do Rio Grande do Sul'),
} as const

export type PhotoKey = keyof typeof photos

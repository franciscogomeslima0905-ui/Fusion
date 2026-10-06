import { createElement, Fragment, type ReactNode } from 'react'

// Versão síncrona de ./deferred.ts, usada só no pré-render: todo o conteúdo sai direto no HTML,
// sem limites de Suspense (que o React "esconde" para revelar via script).
export { FinalCta } from './FinalCta'
export { Gallery } from './Gallery'
export { Hours } from './Hours'
export { Instagram } from './Instagram'
export { Location } from './Location'
export { Plans } from './Plans'
export { Structure } from './Structure'
export { Testimonials } from './Testimonials'
export { WhyFusion } from './WhyFusion'

export const Deferred = ({ children }: { children?: ReactNode; fallback?: ReactNode }) => createElement(Fragment, null, children)

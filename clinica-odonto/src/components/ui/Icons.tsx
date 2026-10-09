import type { ReactNode, SVGProps } from 'react'

const paths = {
  tooth: (
    <path d="M8 3C5.500 3 4 4.800 4 7.200c0 1.900.9 3.200 1.500 5 .7 2.100.9 4.500 1.700 7.100.3 1 1.600 1 1.900 0 .5-1.700.8-4.100 2.900-4.100s2.400 2.400 2.900 4.100c.3 1 1.600 1 1.900 0 .8-2.600 1-5 1.700-7.100.6-1.800 1.500-3.100 1.500-5C20 4.800 18.500 3 16 3c-1.500 0-2.700.8-4 .8S9.500 3 8 3Z" />
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.500" />
      <path d="M2.500 20c0-3.600 2.900-6 6.500-6s6.500 2.400 6.500 6" />
      <path d="M16 4.700a3.500 3.500 0 0 1 0 6.600M18 14.300c2.200.7 3.500 2.600 3.500 5.700" />
    </>
  ),
  heart: <path d="M12 20.500s-8-4.700-8-11A4.500 4.500 0 0 1 12 7a4.500 4.500 0 0 1 8 2.500c0 6.300-8 11-8 11Z" />,
  wallet: (
    <>
      <path d="M3 7.500A2.500 2.500 0 0 1 5.500 5H18a1 1 0 0 1 1 1v2" />
      <path d="M3 7.500V17a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1H5.500A2.500 2.500 0 0 1 3 7.500Z" />
      <circle cx="16" cy="13.500" r="1" />
    </>
  ),
  award: (
    <>
      <circle cx="12" cy="9" r="5.500" />
      <path d="m8.500 13.500-1.500 7 5-2.500 5 2.500-1.500-7" />
    </>
  ),
  smile: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 14.500c1 1.500 2.300 2.200 4 2.200s3-.7 4-2.200M9 9.500h.01M15 9.500h.01" />
    </>
  ),
  tools: (
    <>
      <path d="M14.500 6.500a4 4 0 0 0-5.200 5.200L3.500 17.500a1.800 1.800 0 0 0 2.500 2.500l5.800-5.800a4 4 0 0 0 5.200-5.200l-2.500 2.500-2-.5-.5-2 2.500-2.500Z" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.500 2" />
    </>
  ),
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  check: <path d="m5 12.500 4.500 4.500L19 7.500" />,
  phone: (
    <path d="M5 4h3.500l1.500 4-2 1.500a11 11 0 0 0 6.500 6.500l1.500-2 4 1.500V19a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
  ),
  pin: (
    <>
      <path d="M12 21s-7-6.200-7-11.500a7 7 0 0 1 14 0C19 14.800 12 21 12 21Z" />
      <circle cx="12" cy="9.500" r="2.500" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.500 7 8.500 6 8.500-6" />
    </>
  ),
  instagram: (
    <>
      <rect x="3.500" y="3.500" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17 7h.01" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  calendar: (
    <>
      <rect x="3.500" y="5" width="17" height="15" rx="2.500" />
      <path d="M8 3v4m8-4v4M3.500 10h17" />
    </>
  ),
} satisfies Record<string, ReactNode>

export type IconName = keyof typeof paths

export function Icon({ name, ...props }: { name: IconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {paths[name]}
    </svg>
  )
}

export function StarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="m12 2.800 2.800 5.700 6.200.9-4.500 4.400 1.100 6.200L12 17.100 6.400 20l1.100-6.200L3 9.400l6.200-.9L12 2.800Z" />
    </svg>
  )
}

export function QuoteIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 56" fill="currentColor" aria-hidden {...props}>
      <path d="M0 56V32C0 13.500 9.500 3 28 0v10C18 12.500 14 18 14 26h14v30H0Zm36 0V32c0-18.500 9.500-29 28-32v10c-10 2.500-14 8-14 16h14v30H36Z" />
    </svg>
  )
}

export default function Button({ href, children, variant = 'solid', className = '', ...rest }) {
  const base =
    'cond inline-flex min-h-12 items-center justify-center gap-2 px-6 text-base font-bold tracking-[.12em] transition-colors duration-200'
  const styles = {
    solid: 'bg-red text-white hover:bg-bone hover:text-ink',
    line: 'border border-bone/40 text-bone hover:border-bone hover:bg-bone hover:text-ink',
  }
  const external = /^https?:/.test(href)
  return (
    <a
      href={href}
      className={`${base} ${styles[variant]} ${className}`}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...rest}
    >
      {children}
    </a>
  )
}

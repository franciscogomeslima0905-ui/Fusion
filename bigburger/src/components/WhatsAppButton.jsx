import { generalOrderLink } from '../utils/whatsapp'

export default function WhatsAppButton() {
  return (
    <a
      href={generalOrderLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Pedir pelo WhatsApp"
      className="fixed bottom-4 right-4 z-[70] flex h-14 w-14 items-center justify-center bg-red text-white shadow-[0_8px_30px_rgba(227,27,35,.4)] transition-transform hover:scale-105 sm:bottom-6 sm:right-6"
    >
      <svg viewBox="0 0 32 32" width="28" height="28" fill="currentColor" aria-hidden>
        <path d="M16.04 3C9.4 3 4.02 8.36 4.02 14.98c0 2.12.56 4.18 1.6 6L4 28l7.2-1.9a12 12 0 0 0 4.84 1.02c6.64 0 12.02-5.36 12.02-11.98C28.06 8.36 22.68 3 16.04 3Zm0 21.98c-1.5 0-2.96-.4-4.24-1.16l-.3-.18-4.28 1.12 1.14-4.16-.2-.32a9.9 9.9 0 0 1-1.52-5.3c0-5.5 4.5-9.98 10.04-9.98 5.52 0 10.02 4.48 10.02 9.98 0 5.5-4.5 9.98-10.02 9.98Zm5.5-7.46c-.3-.15-1.78-.88-2.06-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.96 1.18-.18.2-.35.22-.65.08-.3-.15-1.28-.47-2.44-1.5-.9-.8-1.5-1.8-1.68-2.1-.18-.3-.02-.46.13-.6.14-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.68-1.64-.93-2.24-.25-.58-.5-.5-.68-.5h-.58c-.2 0-.53.08-.8.38-.28.3-1.06 1.04-1.06 2.52s1.08 2.92 1.24 3.12c.15.2 2.12 3.22 5.12 4.52.72.3 1.28.5 1.72.64.72.22 1.38.2 1.9.12.58-.08 1.78-.72 2.02-1.42.25-.7.25-1.3.18-1.42-.08-.12-.28-.2-.58-.35Z" />
      </svg>
    </a>
  )
}

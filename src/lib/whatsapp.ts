import { site } from '../config/site'

/** Link oficial (wa.me) que abre a conversa já com a mensagem preenchida — funciona no celular e no desktop. */
export function whatsappLink(message: string): string {
  return `https://wa.me/${site.contact.whatsappNumber}?text=${encodeURIComponent(message)}`
}

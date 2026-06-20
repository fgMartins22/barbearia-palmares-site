/**
 * Abre uma conversa no WhatsApp com uma mensagem pronta.
 * - Remove caracteres não numéricos do telefone.
 * - Garante o código do Brasil (55) quando não houver.
 * - Codifica a mensagem com encodeURIComponent.
 * - Abre em nova aba.
 */
export function openWhatsappMessage(phone: string, message: string): void {
  let digits = (phone || '').replace(/\D/g, '');

  // Remove zeros à esquerda eventuais
  digits = digits.replace(/^0+/, '');

  // Garante o DDI 55 (Brasil) caso o número não comece com 55.
  // Números BR têm 10 ou 11 dígitos (DDD + número); se vier com 12/13, já tem DDI.
  if (!digits.startsWith('55') || digits.length <= 11) {
    digits = '55' + digits;
  }

  const url = `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener');
}

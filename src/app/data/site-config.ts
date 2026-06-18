/* =========================================================
   CONFIGURAÇÃO CENTRAL DO SITE
   ---------------------------------------------------------
   >> EDITE AQUI todos os links, telefone, redes sociais e
      endereço. Tudo neste arquivo é usado pelos componentes.
   ========================================================= */

export const SITE_CONFIG = {
  // Nome da barbearia
  nome: 'Barbearia Palmares',

  // Slogan oficial
  slogan: 'O corte é detalhe, o bom é o café',

  // Número oficial usado no link do WhatsApp (55 + DDD + número)
  whatsapp: 'https://wa.me/5551984217009',

  // Texto que já vai preenchido na mensagem do WhatsApp
  whatsappMensagem:
    'Olá! Gostaria de agendar um horário na Barbearia Palmares.',

  // [EDITAR] TROQUE PELO SEU INSTAGRAM REAL
  instagram: 'https://instagram.com/barbeariapalmares',

  // Link "Abrir no Google Maps" (endereço oficial)
  googleMaps:
    'https://maps.google.com/maps?q=Tv.+Am%C3%A9rico+Silveira,+231+-+Cristo+Redentor,+Porto+Alegre+-+RS,+91360-000',

  // Endereço oficial
  endereco: {
    rua: 'Travessa Américo Silveira, 231',
    bairro: 'Cristo Redentor',
    cidade: 'Porto Alegre - RS',
    cep: 'CEP 91360-000',
    referencia: 'Zona Norte de Porto Alegre',
  },

  // Horário de funcionamento oficial
  horarios: [{ dia: 'Terça a Sábado', horario: '9h às 19h30' }],

  // Telefone oficial exibido na tela
  telefoneExibicao: '(51) 98421-7009',
};

/* Helper para montar o link de WhatsApp já com a mensagem */
export function whatsappLink(): string {
  const texto = encodeURIComponent(SITE_CONFIG.whatsappMensagem);
  return `${SITE_CONFIG.whatsapp}?text=${texto}`;
}

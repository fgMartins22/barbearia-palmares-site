/* =========================================================
   DADOS MOCKADOS (conteúdo de exemplo)
   ---------------------------------------------------------
   >> EDITE livremente os textos, serviços, depoimentos e
      imagens da galeria. Tudo abaixo alimenta os componentes.
   ========================================================= */

export interface Diferencial {
  icone: string; // nome do ícone Lucide (kebab-case)
  titulo: string;
  descricao: string;
}

export interface Servico {
  icone: string; // nome do ícone Lucide (kebab-case)
  titulo: string;
  descricao: string;
  preco: string; // ex.: "R$ 40" — troque pelos seus valores
  // id correspondente em core/constants/services.constants.ts (usado no agendamento)
  bookingId: string;
}

export interface Depoimento {
  nome: string;
  texto: string;
  nota: number; // de 1 a 5
}

export interface ImagemGaleria {
  // [EDITAR] Troque "url" pelo caminho da foto real, ex.: 'assets/galeria/corte1.jpg'
  url: string | null;
  legenda: string;
}

/* ----------------- DIFERENCIAIS (Sobre) ----------------- */
export const DIFERENCIAIS: Diferencial[] = [
  {
    icone: 'award',
    titulo: 'Atendimento de qualidade',
    descricao:
      'Cada cliente é tratado com atenção e cuidado, do início ao fim do atendimento.',
  },
  {
    icone: 'armchair',
    titulo: 'Ambiente confortável',
    descricao:
      'Um espaço acolhedor, limpo e pensado para você relaxar enquanto cuida do visual.',
  },
  {
    icone: 'user-check',
    titulo: 'Profissionais experientes',
    descricao:
      'Barbeiros com anos de prática, sempre atualizados com as melhores técnicas.',
  },
];

/* ----------------- SERVIÇOS ----------------- */
export const SERVICOS: Servico[] = [
  {
    icone: 'scissors',
    titulo: 'Corte',
    descricao:
      'Cortes clássicos e modernos, feitos sob medida para o seu estilo.',
    preco: 'R$ 40,00',
    bookingId: 'corte',
  },
  {
    icone: 'scissors-line-dashed',
    titulo: 'Barba',
    descricao:
      'Modelagem, alinhamento e toalha quente para uma barba impecável.',
    preco: 'R$ 45,00',
    bookingId: 'barba',
  },
  {
    icone: 'sparkles',
    titulo: 'Corte + Barba',
    descricao:
      'O combo completo para você sair renovado e com o visual no ponto.',
    preco: 'R$ 70,00',
    bookingId: 'corte_barba',
  },
  {
    icone: 'star',
    titulo: 'Acabamento',
    descricao:
      'Aquele retoque na pegada, pezinho e contornos para manter o corte sempre alinhado.',
    preco: 'R$ 15,00',
    bookingId: 'acabamento',
  },
];

/* ----------------- GALERIA -----------------
   Deixe url como null para mostrar um placeholder bonito.
   Depois é só apontar para suas fotos reais em /assets. */
export const GALERIA: ImagemGaleria[] = [
  { url: null, legenda: 'Corte degradê' },
  { url: null, legenda: 'Barba modelada' },
  { url: null, legenda: 'Ambiente da barbearia' },
  { url: null, legenda: 'Corte clássico' },
  { url: null, legenda: 'Detalhe do acabamento' },
  { url: null, legenda: 'Cadeira premium' },
];

/* ----------------- DEPOIMENTOS ----------------- */
export const DEPOIMENTOS: Depoimento[] = [
  {
    nome: 'Filipe G.',
    texto:
      'Melhor barbearia da região! Atendimento nota 10 e o corte ficou perfeito.',
    nota: 5,
  },
  {
    nome: 'Eduardo B.',
    texto:
      'Ambiente top, profissionais que entendem do assunto. Virei cliente fiel.',
    nota: 5,
  },
  {
    nome: 'Douglas M.',
    texto:
      'Sempre saio satisfeito. A barba fica impecável e ainda tomo um bom café.',
    nota: 5,
  },
];

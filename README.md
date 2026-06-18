# 💈 Barbearia Palmares — Landing Page

Landing page moderna, responsiva e premium (somente frontend) feita em **Angular**, para a Barbearia Palmares, na Zona Norte de Porto Alegre.

## ▶️ Como rodar

```bash
npm install
npm start
```

O site abre em `http://localhost:4200`.

Para gerar a versão de produção:

```bash
npm run build
```

Os arquivos finais ficam em `dist/barbearia-palmares`.

## ✏️ O que editar (e onde)

Quase tudo que você vai querer trocar está em **dois arquivos**:

| O que mudar | Arquivo |
|---|---|
| WhatsApp, Instagram, Google Maps, endereço, telefone, horários | `src/app/data/site-config.ts` |
| Serviços, preços, depoimentos, diferenciais e galeria | `src/app/data/mock-data.ts` |

Outros pontos úteis:

- **Cores e fontes:** `src/styles.css` (veja as variáveis em `:root`).
- **Textos das seções:** estão nos arquivos `.html` de cada componente em `src/app/components/`.
- **Imagens reais:** coloque os arquivos em `src/assets/` e aponte os caminhos
  (ex.: `assets/galeria/corte1.jpg`) no `mock-data.ts` e nos componentes.
  Procure pelos comentários com `[EDITAR]` no código — eles marcam onde trocar.

## 🖼️ Logo

A logo oficial fica em `src/assets/images/logo.png` e é usada no Header, na Hero,
no Footer e como favicon. A proporção original é sempre preservada (`width: auto`).
Para trocar a logo, basta substituir esse arquivo mantendo o mesmo nome.

## 🎯 Ícones

Os ícones usam a biblioteca [Lucide](https://lucide.dev) (`@lucide/angular`),
todos na cor dourada da marca e com tamanho consistente.

- Os ícones disponíveis são registrados em `src/main.ts` (função `provideLucideIcons`).
  Para adicionar um novo: importe-o de `@lucide/angular`, inclua na lista e use no
  HTML com `<svg lucideIcon="nome-em-kebab-case">` (ex.: `map-pin`, `user-check`).
- WhatsApp e Instagram usam os **logos oficiais das marcas** (SVG), no componente
  `src/app/components/shared/brand-icon.component.ts` — pois o Lucide não inclui
  logos de marcas.

## 🧩 Estrutura dos componentes

```
src/app/
├── app.component.ts          # Monta a página inteira
├── data/
│   ├── site-config.ts        # 🔧 Links, contato e endereço
│   └── mock-data.ts          # 🔧 Serviços, depoimentos, galeria
└── components/
    ├── header/               # Cabeçalho fixo + menu mobile
    ├── hero/                 # Seção de destaque
    ├── about/                # Sobre + diferenciais
    ├── services/             # Serviços
    ├── gallery/              # Galeria
    ├── testimonials/         # Depoimentos
    ├── location/             # Localização + mapa
    ├── contact/              # CTA final
    ├── footer/               # Rodapé
    └── shared/
        └── brand-icon.component.ts  # Logos WhatsApp/Instagram (SVG oficial)
```

## 🎨 Paleta

Preto, dourado, branco e tons escuros — visual masculino, elegante e profissional.

> Projeto 100% frontend: sem backend, sem autenticação.

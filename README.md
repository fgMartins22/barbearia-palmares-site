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

## 📅 Agendamento online (Supabase)

A rota `/agendar` permite ao cliente escolher barbeiro, serviço, data e horário,
e cria um agendamento com status `pending` no Supabase. O botão "Agendar horário"
do header leva para essa página.

### Configurar o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. No painel, abra **SQL Editor** e rode o script `supabase/schema.sql`
   (cria a tabela `appointments`, índices e as policies de RLS).
3. Em **Project Settings > API**, copie a **Project URL** e a **anon public key**.
4. Cole esses valores em:
   - `src/environments/environment.ts` (produção)
   - `src/environments/environment.development.ts` (dev / `ng serve`)

> A `anon key` é pública por design e fica protegida pelas policies de RLS.

### Regras de agendamento (resumo)

- Dias: terça a sábado (sem domingo/segunda) e sem datas passadas.
- Períodos: manhã 09:00–12:00, tarde 13:00–18:00, noite 18:00–19:30.
- Barbeiros: Thiago (tarde + noite), Matheus (manhã + noite).
- Slots de 15 em 15 minutos; o serviço precisa caber inteiro no período.
- Conflito: bloqueia se `novoStart < existenteEnd` e `novoEnd > existenteStart`
  para agendamentos `pending`/`confirmed` do mesmo barbeiro/data.

### Estrutura do agendamento

```
src/app/
├── core/
│   ├── services/   supabase.service.ts, booking.service.ts
│   ├── models/     appointment / barber / service
│   └── constants/  barbers, services, business-hours
└── features/
    ├── landing/    landing.component.ts (a landing completa)
    └── booking/    booking-page.component.* (a página /agendar)
```

### Privacidade (importante)

Para calcular conflitos sem login, a policy de RLS permite que o papel anônimo
leia a tabela (o frontend busca apenas `start_time`/`end_time`/`status`). Em
produção, recomendo trocar por uma função `get_busy_intervals` (exemplo comentado
no fim de `supabase/schema.sql`), que expõe só os intervalos ocupados, sem nome
nem telefone dos clientes.

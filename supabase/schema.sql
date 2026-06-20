-- ============================================================
--  Barbearia Palmares — Esquema do Supabase (Fase 2.1)
--  Rode este script no Supabase: SQL Editor > New query > Run.
-- ============================================================

-- Tabela de agendamentos
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text not null,
  barber_id text not null,
  barber_name text not null,
  service_id text not null,
  service_name text not null,
  service_price numeric not null,
  service_duration_minutes integer not null,
  appointment_date date not null,
  start_time time not null,
  end_time time not null,
  status text not null default 'pending'
    check (status in ('pending','confirmed','rejected','completed','cancelled')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  -- Origem: 'site' (cliente) ou 'internal' (criado no painel)
  source text not null default 'site'
);

-- Se a tabela já existia antes da Fase 2.2, adiciona a coluna updated_at:
alter table public.appointments
  add column if not exists updated_at timestamptz default now();

-- Fase 2.2.1: coluna de origem do agendamento.
alter table public.appointments
  add column if not exists source text not null default 'site';

-- Índice para acelerar a busca por barbeiro + data (cálculo de conflitos)
create index if not exists idx_appointments_barber_date
  on public.appointments (barber_id, appointment_date, status);

-- ============================================================
--  RLS (Row Level Security)
--  Como esta fase é um agendamento público (sem login), liberamos:
--   - INSERT para o papel anônimo, somente com status 'pending';
--   - SELECT das colunas de horário para calcular sobreposição.
-- ============================================================
alter table public.appointments enable row level security;

-- Permite o cliente público criar um agendamento.
-- O site cria como 'pending'; o painel administrativo (mesma anon key, fase
-- temporária) cria agendamentos internos já como 'confirmed'. Por isso o
-- WITH CHECK permite ambos os status na criação.
drop policy if exists "public can create pending appointments" on public.appointments;
create policy "public can create pending appointments"
  on public.appointments
  for insert
  to anon
  with check (status in ('pending','confirmed'));

-- Garante o privilégio de INSERT (todas as colunas) para o papel anônimo.
grant insert on public.appointments to anon;

-- NÃO criamos policy de SELECT para o papel anônimo. Assim, ninguém consegue
-- ler a tabela appointments diretamente do frontend (privacidade dos clientes).
-- A disponibilidade é calculada via função abaixo, que expõe SOMENTE os
-- intervalos ocupados (start_time / end_time), sem nome nem telefone.
drop policy if exists "public can read appointments for availability" on public.appointments;

-- ============================================================
--  TABELA barber_availability (Fase 2.3)
--  Guarda apenas as ALTERAÇÕES manuais de disponibilidade dos barbeiros.
--  Por padrão, todos os horários são considerados disponíveis; só gravamos
--  uma linha quando o barbeiro bloqueia (is_available=false) ou reabre um
--  horário. Evita criar milhares de registros desnecessários.
-- ============================================================
create table if not exists public.barber_availability (
  id uuid primary key default gen_random_uuid(),
  barber_id text not null,
  barber_name text not null,
  availability_date date not null,
  time_slot time not null,
  is_available boolean not null default true,
  reason text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (barber_id, availability_date, time_slot)
);

create index if not exists idx_barber_availability_lookup
  on public.barber_availability (barber_id, availability_date, is_available);

-- RLS do barber_availability.
-- ⚠️ Policies TEMPORÁRIAS para o painel (anon). Substituir por Supabase Auth.
alter table public.barber_availability enable row level security;

drop policy if exists "avail temp anon select" on public.barber_availability;
create policy "avail temp anon select"
  on public.barber_availability for select to anon using (true);

drop policy if exists "avail temp anon insert" on public.barber_availability;
create policy "avail temp anon insert"
  on public.barber_availability for insert to anon with check (true);

drop policy if exists "avail temp anon update" on public.barber_availability;
create policy "avail temp anon update"
  on public.barber_availability for update to anon using (true) with check (true);

grant select, insert, update on public.barber_availability to anon;

-- ============================================================
--  FUNÇÃO DE DISPONIBILIDADE (RPC)
--  Retorna os horários OCUPADOS de um barbeiro em uma data, combinando:
--   1) agendamentos pending/confirmed;
--   2) horários bloqueados manualmente pelo barbeiro (barber_availability),
--      tratados como intervalos de 15 minutos.
--  SECURITY DEFINER: roda com os privilégios do dono da função, contornando a
--  RLS apenas para esta leitura controlada (sem expor dados pessoais).
--  Uso no frontend:
--    supabase.rpc('get_busy_intervals', { p_barber_id, p_date })
-- ============================================================
create or replace function public.get_busy_intervals(p_barber_id text, p_date date)
returns table (start_time time, end_time time)
language sql
security definer
set search_path = public
as $$
  select start_time, end_time
  from public.appointments
  where barber_id = p_barber_id
    and appointment_date = p_date
    and status in ('pending','confirmed')
  union all
  select time_slot as start_time,
         (time_slot + interval '15 minutes')::time as end_time
  from public.barber_availability
  where barber_id = p_barber_id
    and availability_date = p_date
    and is_available = false;
$$;

-- Permite que o papel anônimo (frontend público) chame a função.
grant execute on function public.get_busy_intervals(text, date) to anon;

-- ============================================================
--  TRIGGER updated_at — atualiza automaticamente em qualquer UPDATE
-- ============================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_appointments_updated_at on public.appointments;
create trigger trg_appointments_updated_at
  before update on public.appointments
  for each row
  execute function public.set_updated_at();

-- Mesmo trigger para barber_availability (Fase 2.3).
drop trigger if exists trg_barber_availability_updated_at on public.barber_availability;
create trigger trg_barber_availability_updated_at
  before update on public.barber_availability
  for each row
  execute function public.set_updated_at();

-- ============================================================
--  PAINEL ADMINISTRATIVO (Fase 2.2) — policies TEMPORÁRIAS
--  ⚠️  ATENÇÃO: estas policies liberam SELECT e UPDATE de status para o
--      papel anônimo (anon). Isso é TEMPORÁRIO, só porque ainda não há login.
--      EM PRODUÇÃO, substituir por Supabase Auth (role authenticated) e
--      remover o acesso anônimo de leitura/escrita.
-- ============================================================

-- Leitura completa para o painel (TEMP — trocar por auth).
drop policy if exists "admin temp can read appointments" on public.appointments;
create policy "admin temp can read appointments"
  on public.appointments
  for select
  to anon
  using (true);

-- Atualização de status para o painel (TEMP — trocar por auth).
-- O WITH CHECK garante que o novo status seja um dos valores válidos.
drop policy if exists "admin temp can update status" on public.appointments;
create policy "admin temp can update status"
  on public.appointments
  for update
  to anon
  using (true)
  with check (status in ('pending','confirmed','rejected','completed','cancelled'));

-- Restringe, a nível de COLUNA, o que o anon pode atualizar: apenas status e
-- updated_at. Assim o painel nunca consegue alterar dados pessoais do cliente,
-- mesmo que a policy de linha permita o UPDATE.
revoke update on public.appointments from anon;
grant update (status, updated_at) on public.appointments to anon;
grant select on public.appointments to anon;


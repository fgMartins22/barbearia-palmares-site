-- ============================================================
--  Barbearia Palmares — Fase 2.4
--  Migração de segurança: troca o acesso administrativo anônimo por
--  Supabase Auth (papel `authenticated`).
--
--  Rode este script no Supabase (SQL Editor) DEPOIS do schema.sql.
--  Crie os usuários (Thiago/Matheus) manualmente em Authentication > Users.
-- ============================================================

-- ------------------------------------------------------------
-- 1) APPOINTMENTS — remover acesso administrativo do ANON
-- ------------------------------------------------------------

-- Remove as policies administrativas temporárias do anon.
drop policy if exists "admin temp can read appointments" on public.appointments;
drop policy if exists "admin temp can update status" on public.appointments;

-- Revoga leitura/atualização do anon.
revoke select on public.appointments from anon;
revoke update on public.appointments from anon;

-- ------------------------------------------------------------
-- 2) APPOINTMENTS — manter agendamento público (anon) como 'pending'
-- ------------------------------------------------------------
drop policy if exists "public can create pending appointments" on public.appointments;
create policy "public can create pending appointments"
  on public.appointments
  for insert
  to anon
  with check (status = 'pending');

grant insert on public.appointments to anon;

-- ------------------------------------------------------------
-- 3) RPC pública de disponibilidade continua acessível ao anon
-- ------------------------------------------------------------
grant execute on function public.get_busy_intervals(text, date) to anon;

-- ------------------------------------------------------------
-- 4) APPOINTMENTS — policies para AUTHENTICATED (painel)
-- ------------------------------------------------------------

-- Leitura completa para barbeiros logados.
drop policy if exists "authenticated can read appointments" on public.appointments;
create policy "authenticated can read appointments"
  on public.appointments
  for select
  to authenticated
  using (true);

-- Atualização de status (o WITH CHECK valida o status).
drop policy if exists "authenticated can update appointment status" on public.appointments;
create policy "authenticated can update appointment status"
  on public.appointments
  for update
  to authenticated
  using (true)
  with check (status in ('pending','confirmed','rejected','completed','cancelled'));

-- Criação interna (já confirmada) pelo painel.
drop policy if exists "authenticated can create appointments" on public.appointments;
create policy "authenticated can create appointments"
  on public.appointments
  for insert
  to authenticated
  with check (status in ('pending','confirmed'));

-- 5) UPDATE do authenticated restrito SOMENTE a status e updated_at (coluna).
revoke update on public.appointments from authenticated;
grant update (status, updated_at) on public.appointments to authenticated;
grant select on public.appointments to authenticated;
grant insert on public.appointments to authenticated;

-- ------------------------------------------------------------
-- 6) BARBER_AVAILABILITY — só AUTHENTICATED gerencia
--    (o cliente público nunca lê direto; usa a RPC security definer)
-- ------------------------------------------------------------
drop policy if exists "avail temp anon select" on public.barber_availability;
drop policy if exists "avail temp anon insert" on public.barber_availability;
drop policy if exists "avail temp anon update" on public.barber_availability;

revoke select, insert, update on public.barber_availability from anon;

drop policy if exists "authenticated can read availability" on public.barber_availability;
create policy "authenticated can read availability"
  on public.barber_availability
  for select
  to authenticated
  using (true);

drop policy if exists "authenticated can insert availability" on public.barber_availability;
create policy "authenticated can insert availability"
  on public.barber_availability
  for insert
  to authenticated
  with check (true);

drop policy if exists "authenticated can update availability" on public.barber_availability;
create policy "authenticated can update availability"
  on public.barber_availability
  for update
  to authenticated
  using (true)
  with check (true);

grant select, insert, update on public.barber_availability to authenticated;

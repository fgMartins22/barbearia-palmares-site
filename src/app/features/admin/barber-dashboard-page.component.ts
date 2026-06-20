import { Component, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideDynamicIcon } from '@lucide/angular';

import {
  Appointment,
  AppointmentStatus,
} from '../../core/models/appointment.model';
import { AdminBookingService } from '../../core/services/admin-booking.service';
import { BARBERS } from '../../core/constants/barbers.constants';
import { SITE_CONFIG } from '../../data/site-config';
import { formatDateBR, formatPrice } from '../../core/utils/booking-format.util';
import { openWhatsappMessage } from '../../core/utils/whatsapp.util';
import { STATUS_LABELS } from './status.constants';
import { AppointmentDetailModalComponent } from './appointment-detail-modal.component';
import { BookingDialogComponent } from '../booking/dialog/booking-dialog.component';
import { BookingDialogService } from '../booking/dialog/booking-dialog.service';

interface CalendarCell {
  day: number | null;
  dateStr: string;
  isToday: boolean;
  appts: Appointment[];
}

interface DayGroup {
  dateStr: string;
  label: string;
  appts: Appointment[];
}

/**
 * Painel administrativo dos barbeiros (Fase 2.2.1).
 *
 * ⚠️ Esta rota é temporária e NÃO é segura só por ter um nome difícil.
 *    Em produção, substituir por autenticação Supabase Auth.
 *    Não divulgar o link em áreas públicas.
 */
@Component({
  selector: 'app-barber-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideDynamicIcon,
    AppointmentDetailModalComponent,
    BookingDialogComponent,
  ],
  templateUrl: './barber-dashboard-page.component.html',
  styleUrls: ['./barber-dashboard-page.component.css'],
})
export class BarberDashboardPageComponent implements OnInit {
  // Mês exibido na agenda
  year!: number;
  month!: number; // 0-11

  // Dados
  monthAppointments: Appointment[] = [];
  loading = false;
  errorMessage = '';

  // Filtros (agenda + métricas)
  filterBarber = 'all';
  filterStatus: 'all' | AppointmentStatus = 'all';
  search = '';

  // Histórico (seção própria, com mês/ano e paginação)
  histYear!: number;
  histMonth!: number;
  historyAll: Appointment[] = [];
  histPage = 1;
  readonly pageSize = 5;

  // Modal de detalhes
  selected: Appointment | null = null;
  submitting = false;

  // Modal de confirmação de exclusão
  deleteTarget: Appointment | null = null;

  // Constantes
  barbers = BARBERS;
  statusLabels = STATUS_LABELS;
  weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  readonly monthsPt = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];
  yearOptions: number[] = [];

  dateBR = formatDateBR;
  price = formatPrice;

  constructor(
    private admin: AdminBookingService,
    public bookingDialog: BookingDialogService
  ) {
    // Quando um agendamento é criado pelo modal (interno), recarrega os dados.
    let lastTick = this.bookingDialog.createdTick();
    effect(() => {
      const tick = this.bookingDialog.createdTick();
      if (tick !== lastTick) {
        lastTick = tick;
        this.refresh();
      }
    });
  }

  ngOnInit(): void {
    const now = new Date();
    this.year = now.getFullYear();
    this.month = now.getMonth();
    this.histYear = this.year;
    this.histMonth = this.month;
    this.yearOptions = [0, 1, 2, 3].map((i) => this.year - i);
    this.loadMonth();
    this.loadHistory();
  }

  // ---------------- carregamento ----------------
  async loadMonth(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';
    try {
      this.monthAppointments = await this.admin.getAppointmentsByMonth(
        this.year,
        this.month
      );
    } catch (e) {
      console.error(e);
      this.errorMessage =
        'Não foi possível carregar os agendamentos. Verifique a conexão/configuração.';
      this.monthAppointments = [];
    } finally {
      this.loading = false;
    }
  }

  async loadHistory(): Promise<void> {
    try {
      this.historyAll = await this.admin.getAuditHistory(
        this.histYear,
        this.histMonth
      );
      this.histPage = 1;
    } catch (e) {
      console.error(e);
      this.historyAll = [];
    }
  }

  private async refresh(): Promise<void> {
    await Promise.all([this.loadMonth(), this.loadHistory()]);
  }

  // ---------------- navegação de mês (agenda) ----------------
  goToday(): void {
    const now = new Date();
    this.year = now.getFullYear();
    this.month = now.getMonth();
    this.loadMonth();
  }

  prevMonth(): void {
    if (this.month === 0) {
      this.month = 11;
      this.year--;
    } else {
      this.month--;
    }
    this.loadMonth();
  }

  nextMonth(): void {
    if (this.month === 11) {
      this.month = 0;
      this.year++;
    } else {
      this.month++;
    }
    this.loadMonth();
  }

  get monthLabel(): string {
    return `${this.monthsPt[this.month]} ${this.year}`;
  }

  // ---------------- filtros ----------------
  private matchBarberSearch(a: Appointment): boolean {
    if (this.filterBarber !== 'all' && a.barber_id !== this.filterBarber) {
      return false;
    }
    const term = this.search.trim().toLowerCase();
    if (term && !a.customer_name.toLowerCase().includes(term)) {
      return false;
    }
    return true;
  }

  /** Base para métricas e faturamento (barbeiro + busca). */
  get baseFiltered(): Appointment[] {
    return this.monthAppointments.filter((a) => this.matchBarberSearch(a));
  }

  /** Agenda ativa: aplica também o filtro de status e esconde cancelados. */
  get agendaAppointments(): Appointment[] {
    return this.baseFiltered.filter((a) => {
      if (a.status === 'cancelled') return false;
      if (this.filterStatus !== 'all' && a.status !== this.filterStatus) {
        return false;
      }
      return true;
    });
  }

  // ---------------- métricas ----------------
  get metrics() {
    const list = this.baseFiltered;
    const count = (s: AppointmentStatus) =>
      list.filter((a) => a.status === s).length;
    const revenue = list
      .filter((a) => a.status === 'confirmed' || a.status === 'completed')
      .reduce((sum, a) => sum + Number(a.service_price || 0), 0);
    return {
      pending: count('pending'),
      confirmed: count('confirmed'),
      rejected: count('rejected'),
      cancelled: count('cancelled'),
      completed: count('completed'),
      total: list.length,
      revenue,
    };
  }

  // ---------------- calendário ----------------
  get calendarCells(): CalendarCell[] {
    const cells: CalendarCell[] = [];
    const firstWeekday = new Date(this.year, this.month, 1).getDay();
    const daysInMonth = new Date(this.year, this.month + 1, 0).getDate();
    const todayStr = this.todayStr();

    for (let i = 0; i < firstWeekday; i++) {
      cells.push({ day: null, dateStr: '', isToday: false, appts: [] });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${this.year}-${this.pad(this.month + 1)}-${this.pad(d)}`;
      cells.push({
        day: d,
        dateStr,
        isToday: dateStr === todayStr,
        appts: this.apptsForDate(dateStr),
      });
    }
    while (cells.length % 7 !== 0) {
      cells.push({ day: null, dateStr: '', isToday: false, appts: [] });
    }
    return cells;
  }

  private apptsForDate(dateStr: string): Appointment[] {
    return this.agendaAppointments
      .filter((a) => a.appointment_date === dateStr)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  }

  get dayGroups(): DayGroup[] {
    const map = new Map<string, Appointment[]>();
    for (const a of this.agendaAppointments) {
      const arr = map.get(a.appointment_date) ?? [];
      arr.push(a);
      map.set(a.appointment_date, arr);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([dateStr, appts]) => ({
        dateStr,
        label: formatDateBR(dateStr),
        appts: appts.sort((x, y) => x.start_time.localeCompare(y.start_time)),
      }));
  }

  // ---------------- histórico paginado ----------------
  get historyFiltered(): Appointment[] {
    return this.historyAll.filter((a) => {
      if (!this.matchBarberSearch(a)) return false;
      if (this.filterStatus !== 'all' && a.status !== this.filterStatus) {
        return false;
      }
      return true;
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.historyFiltered.length / this.pageSize));
  }

  get pagedHistory(): Appointment[] {
    const start = (this.histPage - 1) * this.pageSize;
    return this.historyFiltered.slice(start, start + this.pageSize);
  }

  prevPage(): void {
    if (this.histPage > 1) this.histPage--;
  }

  nextPage(): void {
    if (this.histPage < this.totalPages) this.histPage++;
  }

  onHistoryFilterChange(): void {
    this.loadHistory();
  }

  // ---------------- criação manual ----------------
  novoAgendamento(): void {
    this.bookingDialog.openInternal(null);
  }

  onDayClick(dateStr: string): void {
    if (!dateStr) return;
    this.bookingDialog.openInternal(dateStr);
  }

  // ---------------- modal / ações ----------------
  openDetail(a: Appointment): void {
    this.selected = a;
  }

  closeDetail(): void {
    this.selected = null;
  }

  onConfirm(a: Appointment): void {
    this.changeStatus(a, 'confirmed', this.buildConfirmMessage(a));
  }

  onReject(a: Appointment): void {
    this.changeStatus(a, 'rejected', this.buildRejectMessage(a));
  }

  onComplete(a: Appointment): void {
    this.changeStatus(a, 'completed');
  }

  onReactivate(a: Appointment): void {
    this.changeStatus(a, 'pending');
  }

  private async changeStatus(
    a: Appointment,
    status: AppointmentStatus,
    whatsappMessage?: string
  ): Promise<void> {
    if (!a.id) return;
    this.submitting = true;
    try {
      await this.admin.updateAppointmentStatus(a.id, status);
      if (whatsappMessage) {
        openWhatsappMessage(a.customer_phone, whatsappMessage);
      }
      await this.refresh();
      this.closeDetail();
    } catch (e) {
      console.error(e);
      this.errorMessage =
        'Não foi possível atualizar o agendamento. Tente novamente.';
    } finally {
      this.submitting = false;
    }
  }

  // ---------------- exclusão (lógica) ----------------
  askDelete(a: Appointment): void {
    this.deleteTarget = a;
  }

  cancelDelete(): void {
    this.deleteTarget = null;
  }

  async confirmDelete(): Promise<void> {
    const a = this.deleteTarget;
    if (!a?.id) return;
    this.submitting = true;
    try {
      await this.admin.cancelAppointment(a.id);
      await this.refresh();
      this.deleteTarget = null;
      this.closeDetail();
    } catch (e) {
      console.error(e);
      this.errorMessage = 'Não foi possível excluir o agendamento.';
    } finally {
      this.submitting = false;
    }
  }

  // ---------------- mensagens WhatsApp ----------------
  private get enderecoCompleto(): string {
    const e = SITE_CONFIG.endereco;
    return `${e.rua} - ${e.bairro}, ${e.cidade}`;
  }

  private buildConfirmMessage(a: Appointment): string {
    return [
      `Olá, ${a.customer_name}!`,
      'Seu agendamento na Barbearia Palmares foi confirmado.',
      '',
      `Barbeiro: ${a.barber_name}`,
      `Serviço: ${a.service_name}`,
      `Data: ${formatDateBR(a.appointment_date)}`,
      `Horário: ${this.hhmm(a.start_time)}`,
      '',
      `Endereço: ${this.enderecoCompleto}.`,
      '',
      'Te esperamos!',
    ].join('\n');
  }

  private buildRejectMessage(a: Appointment): string {
    return [
      `Olá, ${a.customer_name}!`,
      'Aqui é da Barbearia Palmares.',
      'Infelizmente não conseguimos confirmar seu agendamento para:',
      '',
      `Serviço: ${a.service_name}`,
      `Data: ${formatDateBR(a.appointment_date)}`,
      `Horário: ${this.hhmm(a.start_time)}`,
      '',
      'Pode nos chamar por aqui para encontrarmos outro horário?',
    ].join('\n');
  }

  // ---------------- helpers ----------------
  hhmm(time: string | undefined | null): string {
    return time ? time.slice(0, 5) : '';
  }

  abbrevName(full: string): string {
    const parts = full.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[parts.length - 1][0]}.`;
  }

  decisionDate(a: Appointment): string {
    const iso = a.updated_at || a.created_at;
    return iso ? new Date(iso).toLocaleString('pt-BR') : '—';
  }

  fmtDateTime(iso: string | undefined | null): string {
    return iso ? new Date(iso).toLocaleString('pt-BR') : '—';
  }

  private todayStr(): string {
    const d = new Date();
    return `${d.getFullYear()}-${this.pad(d.getMonth() + 1)}-${this.pad(
      d.getDate()
    )}`;
  }

  private pad(n: number): string {
    return String(n).padStart(2, '0');
  }
}

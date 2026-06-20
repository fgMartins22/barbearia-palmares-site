import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideDynamicIcon } from '@lucide/angular';

import { Barber } from '../../core/models/barber.model';
import { BARBERS } from '../../core/constants/barbers.constants';
import { AvailabilityService } from '../../core/services/availability.service';
import { formatDateBR } from '../../core/utils/booking-format.util';

type SlotFilter = 'all' | 'available' | 'blocked';

/**
 * Gerenciamento de disponibilidade dos barbeiros (Fase 2.3).
 * Bloquear/liberar horários, períodos e dias inteiros. Os bloqueios passam a
 * valer imediatamente para o agendamento dos clientes (via RPC get_busy_intervals).
 */
@Component({
  selector: 'app-availability-page',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideDynamicIcon],
  templateUrl: './availability-page.component.html',
  styleUrls: ['./availability-page.component.css'],
})
export class AvailabilityPageComponent implements OnInit {
  barbers = BARBERS;
  selectedBarber: Barber | null = null;

  selectedDate = this.todayStr();
  minDate = this.todayStr();

  grid: string[] = [];
  blocked = new Set<string>();
  reasons = new Map<string, string>();
  filter: SlotFilter = 'all';

  loading = false;
  saving = false;
  errorMessage = '';

  // Indicadores
  availableToday = 0;
  blockedToday = 0;
  nextBlockedDay: string | null = null;
  weekBlockedHours = 0;

  // Modal de bloqueio em massa / dia inteiro
  showBlockModal = false;
  blockFull = false;
  blockStart = '14:00';
  blockEnd = '18:00';
  blockReason = '';

  dateBR = formatDateBR;

  constructor(private availability: AvailabilityService) {}

  ngOnInit(): void {
    // Pré-seleciona o primeiro barbeiro para já mostrar a agenda.
    if (this.barbers.length > 0) {
      this.selectBarber(this.barbers[0]);
    }
  }

  // ---------------- seleção ----------------
  async selectBarber(b: Barber): Promise<void> {
    this.selectedBarber = b;
    this.grid = this.availability.getDayGrid(b.id);
    await this.loadDay();
    await this.loadIndicators();
  }

  async onDateChange(): Promise<void> {
    await this.loadDay();
  }

  // ---------------- carregamento ----------------
  async loadDay(): Promise<void> {
    if (!this.selectedBarber) return;
    this.loading = true;
    this.errorMessage = '';
    this.blocked = new Set<string>();
    this.reasons = new Map<string, string>();
    try {
      const rows = await this.availability.getAvailability(
        this.selectedBarber.id,
        this.selectedDate
      );
      for (const r of rows) {
        if (!r.is_available) {
          const hhmm = r.time_slot.slice(0, 5);
          this.blocked.add(hhmm);
          if (r.reason) this.reasons.set(hhmm, r.reason);
        }
      }
    } catch (e) {
      console.error(e);
      this.errorMessage = 'Não foi possível carregar a disponibilidade.';
    } finally {
      this.loading = false;
    }
  }

  async loadIndicators(): Promise<void> {
    if (!this.selectedBarber) return;
    const barberId = this.selectedBarber.id;
    const today = this.todayStr();
    const weekEnd = this.addDays(today, 6);
    try {
      const todayGrid = this.availability.getDayGrid(barberId);
      const blockedToday = await this.availability.getBlockedSlots(barberId, today);
      this.blockedToday = blockedToday.length;
      this.availableToday = Math.max(0, todayGrid.length - blockedToday.length);

      this.nextBlockedDay = await this.availability.getNextBlockedDay(
        barberId,
        today
      );

      const weekBlocked = await this.availability.getBlockedBetween(
        barberId,
        today,
        weekEnd
      );
      // cada slot bloqueado = 15 min
      this.weekBlockedHours =
        Math.round(((weekBlocked.length * 15) / 60) * 10) / 10;
    } catch (e) {
      console.error(e);
    }
  }

  // ---------------- grade ----------------
  get filteredSlots(): string[] {
    if (this.filter === 'available') {
      return this.grid.filter((s) => !this.blocked.has(s));
    }
    if (this.filter === 'blocked') {
      return this.grid.filter((s) => this.blocked.has(s));
    }
    return this.grid;
  }

  isBlocked(slot: string): boolean {
    return this.blocked.has(slot);
  }

  reasonFor(slot: string): string {
    return this.reasons.get(slot) ?? '';
  }

  async toggleSlot(slot: string): Promise<void> {
    if (!this.selectedBarber || this.saving) return;
    const currentlyBlocked = this.blocked.has(slot);
    const makeAvailable = currentlyBlocked; // bloqueado -> liberar
    this.saving = true;
    try {
      await this.availability.toggleTimeSlot(
        this.selectedBarber.id,
        this.selectedBarber.name,
        this.selectedDate,
        slot,
        makeAvailable
      );
      // atualização imediata, sem recarregar a página
      if (makeAvailable) {
        this.blocked.delete(slot);
        this.reasons.delete(slot);
      } else {
        this.blocked.add(slot);
      }
      await this.loadIndicators();
    } catch (e) {
      console.error(e);
      this.errorMessage = 'Não foi possível atualizar o horário.';
    } finally {
      this.saving = false;
    }
  }

  // ---------------- modal de bloqueio ----------------
  openBlockModal(fullDay: boolean): void {
    this.blockFull = fullDay;
    this.blockStart = '14:00';
    this.blockEnd = '18:00';
    this.blockReason = '';
    this.showBlockModal = true;
  }

  closeBlockModal(): void {
    this.showBlockModal = false;
  }

  async confirmBlock(): Promise<void> {
    if (!this.selectedBarber) return;
    this.saving = true;
    try {
      if (this.blockFull) {
        await this.availability.blockFullDay(
          this.selectedBarber.id,
          this.selectedBarber.name,
          this.selectedDate,
          this.blockReason
        );
      } else {
        await this.availability.blockTimeRange(
          this.selectedBarber.id,
          this.selectedBarber.name,
          this.selectedDate,
          this.blockStart,
          this.blockEnd,
          this.blockReason
        );
      }
      this.showBlockModal = false;
      await this.loadDay();
      await this.loadIndicators();
    } catch (e) {
      console.error(e);
      this.errorMessage = 'Não foi possível aplicar o bloqueio.';
    } finally {
      this.saving = false;
    }
  }

  // ---------------- helpers ----------------
  private todayStr(): string {
    const d = new Date();
    return `${d.getFullYear()}-${this.pad(d.getMonth() + 1)}-${this.pad(
      d.getDate()
    )}`;
  }

  private addDays(dateStr: string, days: number): string {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date(y, m - 1, d + days);
    return `${dt.getFullYear()}-${this.pad(dt.getMonth() + 1)}-${this.pad(
      dt.getDate()
    )}`;
  }

  private pad(n: number): string {
    return String(n).padStart(2, '0');
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';

import { BARBERS } from '../../core/constants/barbers.constants';
import { SERVICES } from '../../core/constants/services.constants';
import { Barber } from '../../core/models/barber.model';
import { Service } from '../../core/models/service.model';
import { BookingService } from '../../core/services/booking.service';
import { SITE_CONFIG } from '../../data/site-config';

@Component({
  selector: 'app-booking-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideDynamicIcon],
  templateUrl: './booking-page.component.html',
  styleUrls: ['./booking-page.component.css'],
})
export class BookingPageComponent {
  // Identidade visual
  nome = SITE_CONFIG.nome;

  // Dados base
  barbers = BARBERS;
  services = SERVICES;

  // Seleções do usuário
  selectedBarber: Barber | null = null;
  selectedService: Service | null = null;
  selectedDate = '';
  selectedSlot: string | null = null;

  // Campos do cliente
  customerName = '';
  customerPhone = '';
  notes = '';

  // Estado dos horários
  availableSlots: string[] = [];
  loadingSlots = false;
  slotsLoadedOnce = false;
  dateInvalidMessage = '';

  // Estado do envio
  submitting = false;
  successMessage = '';
  errorMessage = '';
  formErrors: string[] = [];

  // Data mínima (hoje) para o input
  readonly minDate = this.todayStr();

  constructor(private booking: BookingService) {}

  // ============================================================
  //  SELEÇÕES
  // ============================================================

  selectBarber(barber: Barber): void {
    this.selectedBarber = barber;
    this.resetSlotState();
    this.recomputeSlots();
  }

  selectService(service: Service): void {
    this.selectedService = service;
    this.resetSlotState();
    this.recomputeSlots();
  }

  onDateChange(): void {
    this.resetSlotState();
    this.recomputeSlots();
  }

  selectSlot(slot: string): void {
    this.selectedSlot = slot;
  }

  private resetSlotState(): void {
    this.selectedSlot = null;
    this.availableSlots = [];
    this.dateInvalidMessage = '';
    this.successMessage = '';
    this.errorMessage = '';
  }

  // ============================================================
  //  CÁLCULO DE HORÁRIOS
  // ============================================================

  private async recomputeSlots(): Promise<void> {
    if (!this.selectedBarber || !this.selectedService || !this.selectedDate) {
      this.slotsLoadedOnce = false;
      return;
    }

    // Valida o dia da semana antes de consultar o banco.
    if (!this.booking.isWorkingDay(this.selectedDate)) {
      this.dateInvalidMessage =
        'Atendemos de terça a sábado. Escolha outra data.';
      this.availableSlots = [];
      this.slotsLoadedOnce = true;
      return;
    }

    this.loadingSlots = true;
    this.slotsLoadedOnce = true;
    try {
      this.availableSlots = await this.booking.getAvailableSlots(
        this.selectedBarber.id,
        this.selectedService.id,
        this.selectedDate
      );
    } catch (err) {
      this.errorMessage =
        'Não foi possível carregar os horários. Tente novamente.';
      this.availableSlots = [];
      console.error(err);
    } finally {
      this.loadingSlots = false;
    }
  }

  // ============================================================
  //  CONFIRMAÇÃO
  // ============================================================

  get canSubmit(): boolean {
    return (
      !!this.selectedBarber &&
      !!this.selectedService &&
      !!this.selectedDate &&
      !!this.selectedSlot &&
      this.customerName.trim().length > 0 &&
      this.isPhoneValid(this.customerPhone)
    );
  }

  /** Telefone: apenas números, espaços, parênteses, hífen e +. */
  isPhoneValid(phone: string): boolean {
    const value = phone.trim();
    return value.length > 0 && /^[0-9\s()+\-]+$/.test(value);
  }

  private validateForm(): boolean {
    const errors: string[] = [];
    if (!this.selectedBarber) errors.push('Selecione um barbeiro.');
    if (!this.selectedService) errors.push('Selecione um serviço.');
    if (!this.selectedDate) errors.push('Selecione uma data.');
    if (!this.selectedSlot) errors.push('Selecione um horário.');
    if (this.customerName.trim().length === 0)
      errors.push('Informe o seu nome.');
    if (this.customerPhone.trim().length === 0) {
      errors.push('Informe o seu telefone.');
    } else if (!this.isPhoneValid(this.customerPhone)) {
      errors.push(
        'Telefone inválido. Use apenas números, espaços, ( ), - e +.'
      );
    }
    this.formErrors = errors;
    return errors.length === 0;
  }

  async confirm(): Promise<void> {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.validateForm()) {
      return;
    }

    this.submitting = true;
    try {
      await this.booking.createAppointment({
        customerName: this.customerName,
        customerPhone: this.customerPhone,
        barberId: this.selectedBarber!.id,
        serviceId: this.selectedService!.id,
        date: this.selectedDate,
        startTime: this.selectedSlot!,
        notes: this.notes,
      });

      this.successMessage =
        'Agendamento solicitado com sucesso! A Barbearia Palmares irá confirmar seu horário pelo WhatsApp.';
      this.resetAfterSuccess();
    } catch (err: unknown) {
      this.errorMessage =
        err instanceof Error
          ? err.message
          : 'Não foi possível concluir o agendamento. Tente novamente.';
      // Recarrega os horários, pois o slot pode ter sido ocupado.
      this.recomputeSlots();
    } finally {
      this.submitting = false;
    }
  }

  /** Limpa o formulário após sucesso, mantendo a mensagem de confirmação. */
  private resetAfterSuccess(): void {
    this.selectedBarber = null;
    this.selectedService = null;
    this.selectedDate = '';
    this.selectedSlot = null;
    this.customerName = '';
    this.customerPhone = '';
    this.notes = '';
    this.availableSlots = [];
    this.slotsLoadedOnce = false;
    this.formErrors = [];
  }

  novoAgendamento(): void {
    this.successMessage = '';
  }

  // ============================================================
  //  HELPERS DE EXIBIÇÃO
  // ============================================================

  formatPrice(value: number): string {
    return 'R$ ' + value.toFixed(2).replace('.', ',');
  }

  private todayStr(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}

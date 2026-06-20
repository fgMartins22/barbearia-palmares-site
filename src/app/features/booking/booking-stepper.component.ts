import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideDynamicIcon } from '@lucide/angular';

import { Barber } from '../../core/models/barber.model';
import { Service } from '../../core/models/service.model';
import { SERVICES } from '../../core/constants/services.constants';
import { BookingService } from '../../core/services/booking.service';
import {
  BookingFlowData,
  CustomerData,
  emptyBookingFlow,
} from './booking-flow.types';
import { BookingMode, BookingDialogService } from './dialog/booking-dialog.service';
import { SiteBookingHandler } from './handlers/site-booking.handler';
import { WhatsappBookingHandler } from './handlers/whatsapp-booking.handler';
import { InternalBookingHandler } from './handlers/internal-booking.handler';

import { BarberSelectorStepComponent } from './steps/barber-selector-step.component';
import { ServiceSelectorStepComponent } from './steps/service-selector-step.component';
import { DateSelectorStepComponent } from './steps/date-selector-step.component';
import { TimeSelectorStepComponent } from './steps/time-selector-step.component';
import { CustomerDataStepComponent } from './steps/customer-data-step.component';
import { BookingSummaryStepComponent } from './steps/booking-summary-step.component';

/**
 * Orquestra o fluxo de agendamento em etapas (uma decisão por vez),
 * com animação suave de fade + slide a cada nova etapa.
 */
@Component({
  selector: 'app-booking-stepper',
  standalone: true,
  imports: [
    CommonModule,
    LucideDynamicIcon,
    BarberSelectorStepComponent,
    ServiceSelectorStepComponent,
    DateSelectorStepComponent,
    TimeSelectorStepComponent,
    CustomerDataStepComponent,
    BookingSummaryStepComponent,
  ],
  templateUrl: './booking-stepper.component.html',
  styleUrls: ['./booking-stepper.component.css'],
})
export class BookingStepperComponent implements OnInit {
  @Input() mode: BookingMode = 'site';
  @Input() preselectedServiceId: string | null = null;
  @Input() preselectedDate: string | null = null;

  /** Pede para voltar à tela de escolha (WhatsApp/Site). */
  @Output() requestChoice = new EventEmitter<void>();
  /** Pede para fechar o modal. */
  @Output() requestClose = new EventEmitter<void>();

  flow: BookingFlowData = emptyBookingFlow();
  step = 1; // 1..6
  minDate = this.todayStr();
  dateInvalidMessage = '';

  // Horários
  slots: string[] = [];
  loadingSlots = false;

  // Envio
  submitting = false;
  errorMessage = '';
  done = false;
  successMessage = '';

  constructor(
    private booking: BookingService,
    private siteHandler: SiteBookingHandler,
    private whatsappHandler: WhatsappBookingHandler,
    private internalHandler: InternalBookingHandler,
    private dialog: BookingDialogService
  ) {}

  ngOnInit(): void {
    if (this.preselectedServiceId) {
      const svc = SERVICES.find((s) => s.id === this.preselectedServiceId);
      if (svc) {
        this.flow.service = svc;
      }
    }
    if (this.preselectedDate) {
      this.flow.date = this.preselectedDate;
    }
  }

  // ---------------- NAVEGAÇÃO ----------------
  goBack(): void {
    if (this.step > 1) {
      this.step--;
    } else if (this.mode === 'internal') {
      // No fluxo interno não há tela de escolha (WhatsApp/Site): apenas fecha.
      this.requestClose.emit();
    } else {
      this.requestChoice.emit();
    }
  }

  // ---------------- ETAPA 1: BARBEIRO ----------------
  onBarber(barber: Barber): void {
    this.flow.barber = barber;
    this.step = 2;
  }

  // ---------------- ETAPA 2: SERVIÇO ----------------
  onService(service: Service): void {
    this.flow.service = service;
    // Limpa horário previamente escolhido, pois a duração mudou.
    this.flow.time = null;
    this.step = 3;
    // Se a data já veio pré-selecionada (clique num dia da agenda), avança.
    if (this.flow.date) {
      this.onDate(this.flow.date);
    }
  }

  // ---------------- ETAPA 3: DATA ----------------
  onDate(date: string): void {
    this.flow.date = date;
    this.flow.time = null;
    this.dateInvalidMessage = '';

    if (!date) return;

    if (!this.booking.isWorkingDay(date)) {
      this.dateInvalidMessage =
        'Atendemos de terça a sábado. Escolha outra data.';
      return;
    }

    this.step = 4;
    this.loadSlots();
  }

  private async loadSlots(): Promise<void> {
    if (!this.flow.barber || !this.flow.service || !this.flow.date) return;
    this.loadingSlots = true;
    this.slots = [];
    try {
      this.slots = await this.booking.getAvailableSlotsSafe(
        this.flow.barber.id,
        this.flow.service.id,
        this.flow.date
      );
    } finally {
      this.loadingSlots = false;
    }
  }

  // ---------------- ETAPA 4: HORÁRIO ----------------
  onTime(time: string): void {
    this.flow.time = time;
    this.step = 5;
  }

  // ---------------- ETAPA 5: DADOS ----------------
  onCustomer(data: CustomerData): void {
    this.flow.customerName = data.name;
    this.flow.customerPhone = data.phone;
    this.flow.notes = data.notes;
  }

  get customerValid(): boolean {
    const name = this.flow.customerName.trim();
    const phoneDigits = this.flow.customerPhone.replace(/\D/g, '');
    return name.length > 0 && phoneDigits.length >= 10;
  }

  goToSummary(): void {
    if (this.customerValid) {
      this.step = 6;
    }
  }

  // ---------------- ETAPA 6: CONFIRMAÇÃO ----------------
  async confirm(): Promise<void> {
    this.errorMessage = '';
    this.submitting = true;
    try {
      if (this.mode === 'whatsapp') {
        this.whatsappHandler.handle(this.flow);
        this.successMessage =
          'Tudo pronto! Abrimos o WhatsApp com a sua solicitação. É só enviar a mensagem para a Barbearia Palmares.';
      } else if (this.mode === 'internal') {
        await this.internalHandler.handle(this.flow);
        this.dialog.notifyCreated();
        this.successMessage =
          'Agendamento interno criado e já confirmado na agenda.';
      } else {
        await this.siteHandler.handle(this.flow);
        this.dialog.notifyCreated();
        this.successMessage =
          'Agendamento solicitado com sucesso! A Barbearia Palmares irá confirmar seu horário pelo WhatsApp.';
      }
      this.done = true;
    } catch (err: unknown) {
      this.errorMessage =
        err instanceof Error
          ? err.message
          : 'Não foi possível concluir. Tente novamente.';
      // O horário pode ter sido ocupado: recarrega a lista.
      this.loadSlots();
    } finally {
      this.submitting = false;
    }
  }

  restart(): void {
    this.flow = emptyBookingFlow();
    this.step = 1;
    this.slots = [];
    this.done = false;
    this.successMessage = '';
    this.errorMessage = '';
    this.dateInvalidMessage = '';
  }

  // ---------------- HELPERS ----------------
  private todayStr(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}

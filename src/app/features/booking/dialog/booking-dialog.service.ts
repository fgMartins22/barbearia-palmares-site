import { Injectable, signal } from '@angular/core';

/** Qual tela do modal está visível. */
export type DialogView = 'choice' | 'stepper';
/** Canal de finalização do agendamento. */
export type BookingMode = 'site' | 'whatsapp' | 'internal';

/**
 * Estado central do modal de agendamento.
 * Qualquer componente (header, hero, cards de serviço...) pode abrir o modal
 * injetando este serviço e chamando os métodos abaixo.
 */
@Injectable({ providedIn: 'root' })
export class BookingDialogService {
  /** Modal aberto? */
  readonly isOpen = signal(false);
  /** Tela atual: escolha (WhatsApp/Site) ou o passo a passo. */
  readonly view = signal<DialogView>('choice');
  /** Canal escolhido para finalizar. */
  readonly mode = signal<BookingMode>('site');
  /** Serviço pré-selecionado (quando aberto a partir de um card de serviço). */
  readonly preselectedServiceId = signal<string | null>(null);
  /** Data pré-selecionada (quando aberto a partir de um dia da agenda). */
  readonly preselectedDate = signal<string | null>(null);
  /** Contador incrementado a cada agendamento criado (para o painel atualizar). */
  readonly createdTick = signal(0);

  /** Abre o modal inicial com as duas opções (WhatsApp / Site). */
  openChoice(): void {
    this.preselectedServiceId.set(null);
    this.preselectedDate.set(null);
    this.view.set('choice');
    this.open();
  }

  /** Abre direto no passo a passo do SITE (ex.: clique num card de serviço). */
  openSite(preselectedServiceId: string | null = null): void {
    this.preselectedServiceId.set(preselectedServiceId);
    this.preselectedDate.set(null);
    this.mode.set('site');
    this.view.set('stepper');
    this.open();
  }

  /** Abre direto no passo a passo do WHATSAPP. */
  openWhatsapp(preselectedServiceId: string | null = null): void {
    this.preselectedServiceId.set(preselectedServiceId);
    this.preselectedDate.set(null);
    this.mode.set('whatsapp');
    this.view.set('stepper');
    this.open();
  }

  /**
   * Abre o fluxo INTERNO (painel administrativo): mesmo passo a passo do
   * cliente, mas o agendamento é criado já como 'confirmed'.
   * Aceita uma data pré-selecionada (clique num dia da agenda).
   */
  openInternal(preselectedDate: string | null = null): void {
    this.preselectedServiceId.set(null);
    this.preselectedDate.set(preselectedDate);
    this.mode.set('internal');
    this.view.set('stepper');
    this.open();
  }

  /** Notifica que um agendamento foi criado (o painel observa para recarregar). */
  notifyCreated(): void {
    this.createdTick.update((v) => v + 1);
  }

  /** A partir da tela de escolha, avança para o passo a passo. */
  chooseMode(mode: BookingMode): void {
    this.mode.set(mode);
    this.view.set('stepper');
  }

  /** Volta da etapa para a tela de escolha. */
  backToChoice(): void {
    this.view.set('choice');
  }

  close(): void {
    this.isOpen.set(false);
    this.unlockScroll();
  }

  private open(): void {
    this.isOpen.set(true);
    this.lockScroll();
  }

  private lockScroll(): void {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  private unlockScroll(): void {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }
}

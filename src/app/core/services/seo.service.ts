import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Meta } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

/**
 * Aplica o domínio oficial (environment.siteUrl) nas tags de SEO em runtime
 * (canonical, og:url, og:image, twitter:image). É a fonte única do domínio no
 * lado Angular; o index.html mantém valores estáticos como fallback para
 * crawlers que não executam JS.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  constructor(
    private meta: Meta,
    @Inject(DOCUMENT) private document: Document
  ) {}

  applySiteUrl(): void {
    const base = environment.siteUrl.replace(/\/+$/, '');
    const url = `${base}/`;
    const image = `${base}/assets/images/logo.png`;

    this.setCanonical(url);
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ name: 'twitter:image', content: image });
  }

  private setCanonical(url: string): void {
    let link = this.document.querySelector<HTMLLinkElement>(
      "link[rel='canonical']"
    );
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}

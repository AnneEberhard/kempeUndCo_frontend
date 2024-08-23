import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScrollService {

  private scrollContainer: HTMLElement | null = null;
  showScrollTopButton: boolean = false;
  scrollThreshold!: number;

  setActiveScrollContainer(container: HTMLElement | null): void {
    this.removeScrollListener();
    this.scrollContainer = container;
    this.bindScrollListener();
  }

  setThreshold(threshold: number) {
    this.scrollThreshold = threshold;
  }

  private bindScrollListener(): void {
    if (this.scrollContainer) {
      this.scrollContainer.addEventListener('scroll', this.onScroll.bind(this));
      window.addEventListener('scroll', this.onScroll.bind(this.scrollContainer));
    }
  }

  private removeScrollListener(): void {
    if (this.scrollContainer) {
      this.scrollContainer.removeEventListener('scroll', this.onScroll.bind(this));
    }
    window.removeEventListener('scroll', this.onScroll.bind(this));
  }

  private onScroll(event: Event): void {
    if (!this.scrollContainer) return;

    const scrollPosition = this.scrollContainer.scrollTop || window.scrollY;
    this.showScrollTopButton = scrollPosition > this.scrollThreshold;
  }
}

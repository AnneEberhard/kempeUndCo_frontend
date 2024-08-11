import { AfterViewInit, Component, ElementRef, HostListener, Inject, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-scroll-to-top-button',
  standalone: true,
  imports: [],
  templateUrl: './scroll-to-top-button.component.html',
  styleUrl: './scroll-to-top-button.component.scss'
})
export class ScrollToTopButtonComponent {
  showScrollTopButton: boolean = false;
  scrollThreshold: number;
  scrollContainer!: HTMLElement;
  isBrowser: boolean;

  constructor(private el: ElementRef, @Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.scrollThreshold = this.isBrowser ? window.innerHeight * 0.2 : 0;
  }

  /**
   * Smoothly scrolls the container to the top.
   */
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Handles the scroll event to toggle the visibility of the scroll-to-top button
   * based on the scroll position.
   */
  @HostListener('window:scroll', [])
  onScroll(): void {
    const scrollPosition = window.scrollY;
    this.showScrollTopButton = scrollPosition > this.scrollThreshold;
  }
}

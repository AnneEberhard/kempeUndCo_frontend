import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-scroll-to-top-button',
  standalone: true,
  imports: [],
  templateUrl: './scroll-to-top-button.component.html',
  styleUrl: './scroll-to-top-button.component.scss'
})
export class ScrollToTopButtonComponent implements AfterViewInit, OnDestroy {
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
    if (this.isBrowser) {
      this.scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Lifecycle hook that is called after the component's view has been fully initialized.
   * Sets up the scroll container and attaches a scroll event listener.
   */
  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.scrollContainer = document.getElementById('mainContainer') as HTMLElement;
      this.scrollContainer.addEventListener('scroll', this.onScroll.bind(this));
    }
  }

  /**
   * Lifecycle hook that is called when the component is destroyed.
   * Removes the scroll event listener from the scroll container.
   */
  ngOnDestroy(): void {
    if (this.isBrowser) {
      this.scrollContainer.removeEventListener('scroll', this.onScroll.bind(this));
    }
  }

  /**
   * Handles the scroll event to toggle the visibility of the scroll-to-top button
   * based on the scroll position.
   */
  onScroll(): void {
    const scrollPosition = this.scrollContainer.scrollTop;
    this.showScrollTopButton = scrollPosition > this.scrollThreshold;
  }
}

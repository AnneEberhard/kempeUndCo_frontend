import { AfterViewInit, Component, ElementRef, HostListener, Inject, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';


@Component({
  selector: 'app-scroll-to-top-button',
  standalone: true,
  imports: [],
  templateUrl: './scroll-to-top-button.component.html',
  styleUrl: './scroll-to-top-button.component.scss'
})
export class ScrollToTopButtonComponent implements AfterViewInit, OnDestroy{
    showScrollTopButton: boolean = false;
    scrollThreshold: number;
    scrollContainers: HTMLElement[] = [];
    isBrowser: boolean;
  
    constructor(private el: ElementRef, @Inject(PLATFORM_ID) private platformId: Object) {
      this.isBrowser = isPlatformBrowser(platformId);
      this.scrollThreshold = this.isBrowser ? window.innerHeight * 0.2 : 0;
    }
  
    scrollToTop(): void {
      if (this.isBrowser) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  
    ngAfterViewInit(): void {
      if (this.isBrowser) {
        // Fügen Sie Event-Listener zu mehreren potenziellen Scroll-Containern hinzu
        const possibleScrollContainers = [
          document.getElementById('mainContainer'),
         // document.querySelector('router-outlet')
        ];
  
        possibleScrollContainers.forEach(container => {
          if (container) {
            container.addEventListener('scroll', this.onScroll.bind(this));
            this.scrollContainers.push(container as HTMLElement);
            console.log('Added scroll event listener to:', container);
          }
        });
  
        // Fügen Sie auch einen Event-Listener zu window hinzu
        window.addEventListener('scroll', this.onScroll.bind(this));
      }
    }
  
    ngOnDestroy(): void {
      if (this.isBrowser) {
        // Entfernen Sie Event-Listener von allen potenziellen Scroll-Containern
        this.scrollContainers.forEach(container => {
          container.removeEventListener('scroll', this.onScroll.bind(this));
        });
  
        window.removeEventListener('scroll', this.onScroll.bind(this));
      }
    }
  
    onScroll(event: Event): void {
      if (!this.isBrowser) {
        return;
      }
  
      const scrollContainer = event.target as HTMLElement;
      const scrollPosition = scrollContainer.scrollTop || window.scrollY;
      //console.log('Scroll position:', scrollPosition, 'in container:', scrollContainer);
  
      this.showScrollTopButton = scrollPosition > this.scrollThreshold;
    }
  }

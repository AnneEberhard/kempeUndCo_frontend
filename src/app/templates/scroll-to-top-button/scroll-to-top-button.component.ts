import { AfterViewInit, Component, ElementRef, HostListener, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ScrollService } from '../../services/scroll.service';


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
  scrollContainers: HTMLElement[] = [];
  scrollContainer: HTMLElement | null = null;
  isBrowser: boolean;


  constructor(private el: ElementRef, @Inject(PLATFORM_ID) private platformId: Object, public scrollService: ScrollService) {
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
      this.scrollService.setActiveScrollContainer(document.getElementById('mainContainer'));
      this.scrollService.setThreshold(this.scrollThreshold);
      window.addEventListener('scroll', this.onScroll.bind(this));
    }
  }

  ngOnDestroy(): void {
    if (this.isBrowser) {
      window.removeEventListener('scroll', this.onScroll.bind(this));
      this.scrollService.setActiveScrollContainer(null);
    }

  }


  onScroll(event: Event): void {
    if (!this.isBrowser) {
      return;
    }
    const scrollContainer = event.target as HTMLElement;
    const scrollPosition = scrollContainer.scrollTop || window.scrollY;
    this.showScrollTopButton = scrollPosition > this.scrollThreshold;
  }
}

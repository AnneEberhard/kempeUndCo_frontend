import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScrollService {

  private scrollContainer: HTMLElement | null = null;
  showScrollTopButton: boolean = false;
  scrollThreshold!: number;

  /**
   * Sets the active scroll container and binds a scroll listener to it.
   * 
   * This method sets the container element that will be monitored for scroll events. It first removes any existing
   * scroll listener from the previous container and then binds a new scroll listener to the specified container.
   *
   * @param {HTMLElement | null} container - The HTML element to be used as the scroll container. If `null`, no container will be set.
   */
  setActiveScrollContainer(container: HTMLElement | null): void {
    this.removeScrollListener();
    this.scrollContainer = container;
    this.bindScrollListener();
  }

  /**
   * Sets the scroll threshold for showing the scroll top button.
   * 
   * This method updates the scroll threshold value. The scroll top button will be shown when the scroll position
   * exceeds this threshold.
   *
   * @param {number} threshold - The scroll threshold value. When the scroll position is greater than this value, the scroll top button will be shown.
   */
  setThreshold(threshold: number) {
    this.scrollThreshold = threshold;
  }

  /**
   * Binds the scroll event listener to the active scroll container and the window.
   * 
   * This method attaches the scroll event listener to the currently active scroll container and the window.
   * The `onScroll` method will be called whenever a scroll event occurs.
   */
  private bindScrollListener(): void {
    if (this.scrollContainer) {
      this.scrollContainer.addEventListener('scroll', this.onScroll.bind(this));
      window.addEventListener('scroll', this.onScroll.bind(this.scrollContainer));
    }
  }

  /**
   * Removes the scroll event listener from the active scroll container and the window.
   * 
   * This method detaches the scroll event listener from the currently active scroll container and the window.
   */
  private removeScrollListener(): void {
    if (this.scrollContainer) {
      this.scrollContainer.removeEventListener('scroll', this.onScroll.bind(this));
    }
    window.removeEventListener('scroll', this.onScroll.bind(this));
  }

  /**
  * Handles the scroll event and updates the visibility of the scroll top button.
  * 
  * This method is called whenever a scroll event occurs. It calculates the current scroll position and updates
  * the visibility of the scroll top button based on whether the scroll position exceeds the set threshold.
  *
  * @param {Event} event - The scroll event that triggered this method.
  */
  private onScroll(event: Event): void {
    if (!this.scrollContainer) return;

    const scrollPosition = this.scrollContainer.scrollTop || window.scrollY;
    this.showScrollTopButton = scrollPosition > this.scrollThreshold;
  }
}

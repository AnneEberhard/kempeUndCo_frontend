import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, fromEvent, merge, Subscription } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class InactivityService implements OnDestroy {

  // TESTWERTE: jeweils 10 Sekunden: 10_000
  // Realwerte: 20 Minuten plus 10 Minuten = 30 Minuten insgesamt
  private readonly warningAfter = 20 * 60 * 1000;
  private readonly logoutAfterWarning = 10 * 60 * 1000;

  private warningTimer?: ReturnType<typeof setTimeout>;
  private logoutTimer?: ReturnType<typeof setTimeout>;
  private activitySubscription?: Subscription;

  private readonly warningSubject = new BehaviorSubject<boolean>(false);
  readonly showWarning$ = this.warningSubject.asObservable();

  private started = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  start(): void {
    if (this.started) {
      return;
    }

    this.started = true;

    const activityEvents$ = merge(
      fromEvent(document, 'mousemove'),
      fromEvent(document, 'mousedown'),
      fromEvent(document, 'keydown'),
      fromEvent(document, 'touchstart'),
      fromEvent(document, 'scroll'),
      fromEvent(document, 'click')
    );

    this.activitySubscription = activityEvents$.subscribe(() => {
      if (!this.authService.getAccessToken()) {
        this.stop();
        return;
      }

      this.resetTimers();
    });

    // Bereits angemeldete Nutzer ebenfalls überwachen.
    if (this.authService.getAccessToken()) {
      this.resetTimers();
    }
  }

  private resetTimers(): void {
    this.clearTimers();
    this.warningSubject.next(false);

    this.warningTimer = setTimeout(() => {
      if (!this.authService.getAccessToken()) {
        this.stop();
        return;
      }

      this.warningSubject.next(true);

      this.logoutTimer = setTimeout(() => {
        this.logout();
      }, this.logoutAfterWarning);

    }, this.warningAfter);
  }

  continueSession(): void {
    if (!this.authService.getAccessToken()) {
      this.logout();
      return;
    }

    this.resetTimers();
  }

  logout(): void {
    this.stop();
    this.authService.clearLocalStorage();
    void this.router.navigate(['/login']);
  }

  stop(): void {
    this.clearTimers();
    this.activitySubscription?.unsubscribe();
    this.activitySubscription = undefined;
    this.warningSubject.next(false);
    this.started = false;
  }

  private clearTimers(): void {
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = undefined;
    }

    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
      this.logoutTimer = undefined;
    }
  }

  ngOnDestroy(): void {
    this.stop();
  }
}

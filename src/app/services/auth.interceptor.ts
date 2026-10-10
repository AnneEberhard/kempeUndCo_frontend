import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, switchMap, throwError } from 'rxjs';

import { AuthService } from './auth.service';

const excludedUrls = [
  '/login',
  '/register',
  '/forgot',
  '/reset-password',
  '/activation-success',
  '/activation-failure',
  '/legal',
  '/login/refresh/',
  '/token/blacklist/'
];

export const authInterceptor = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isExcludedUrl = excludedUrls.some(url =>
    req.url.includes(url)
  );

  if (isExcludedUrl) {
    return next(req);
  }

  const authToken = authService.getAccessToken();

  const request = authToken
    ? req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`
      }
    })
    : req;

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }

      if (!authToken) {
        authService.clearLocalStorage();
        void router.navigate(['/login']);
        return throwError(() => error);
      }

      return handle401Error(
        req,
        next,
        authService,
        router
      );
    })
  );
};

const handle401Error = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  router: Router
): Observable<HttpEvent<unknown>> => {
  return authService.refreshToken().pipe(
    switchMap((token: { access: string }) => {
      if (!token?.access) {
        throw new Error('Refresh lieferte keinen Access-Token.');
      }

      authService.setAccessToken(token.access);

      const cloned = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token.access}`
        }
      });
      return next(cloned);
    }),
    catchError((error: unknown) => {
      authService.clearLocalStorage();
      void router.navigate(['/login']);

      return throwError(() => error);
    })
  );
};

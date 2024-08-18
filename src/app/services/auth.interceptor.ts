import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const authToken = authService.getAccessToken();

  // URLs, die vom Interceptor ausgeschlossen werden sollen
  const excludedUrls = [
    '/login',
    '/register',
    '/forgot',
    '/reset-password',
    '/activation-success',
    '/activation-failure',
    '/legal'
  ];

  // Überprüfe, ob die URL ausgeschlossen werden soll
  const isExcludedUrl = excludedUrls.some(url => req.url.includes(url));

  if (authToken && !isExcludedUrl) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`
      }
    });

    return next(cloned).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && error.error?.code === 'token_not_valid') {
          // Handle 401 error and attempt to refresh the token
          return handle401Error(req, next, authService);
        }
        return throwError(() => new Error(error.message));
      })
    );
  }
  
  return next(req);
};

const handle401Error = (request: HttpRequest<any>, next: HttpHandlerFn, authService: AuthService): Observable<HttpEvent<any>> => {
  return authService.refreshToken().pipe(
    switchMap((token: any) => {
      authService.setAccessToken(token.access);
      const cloned = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token.access}`
        }
      });
      return next(cloned);
    }),
    catchError((error) => {
      authService.logout();
      return throwError(() => new Error(error.message));
    })
  );
};

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

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
    return next(cloned);
  }
  return next(req);
};

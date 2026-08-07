import { ApplicationConfig, ErrorHandler, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { LOCALE_ID } from '@angular/core';
import { authInterceptor } from './services/auth.interceptor';
import { QuillModule } from 'ngx-quill';
import { routes } from './app.routes';
import * as Sentry from "@sentry/angular";
import { inject, provideAppInitializer } from '@angular/core';
// added here: provideHttpClient(withInterceptors([authInterceptor, headerInterceptor])), causes CORS Error


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: LOCALE_ID, useValue: 'de' },
    importProvidersFrom(QuillModule.forRoot()),
    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler({
        showDialog: true,
      }),
    }, {
      provide: Sentry.TraceService,
      deps: [Router],
    },
    provideAppInitializer(() => {
  inject(Sentry.TraceService);
})
  
  ]
};

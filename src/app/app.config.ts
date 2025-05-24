import { APP_INITIALIZER, ApplicationConfig, ErrorHandler, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { LOCALE_ID } from '@angular/core';
import { authInterceptor } from './services/auth.interceptor';
import { QuillModule } from 'ngx-quill';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import * as Sentry from "@sentry/angular";
import { headerInterceptor } from './services/header.interceptor';
// added here: provideHttpClient(withInterceptors([authInterceptor, headerInterceptor])), causes CORS Error


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
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
    {
      provide: APP_INITIALIZER,
      useFactory: () => () => {},
      deps: [Sentry.TraceService],
      multi: true,
    },
  ]
};

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import * as Sentry from "@sentry/angular";


Sentry.init({
  dsn: "https://88e9c349e9356205c0baac4c4e17f81b@o4507470803042304.ingest.de.sentry.io/4507917749452880",
  integrations: [
    // Sentry.browserTracingIntegration(), // Entferne oder kommentiere aus, falls Tracing nicht benötigt wird
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 0, // Deaktiviert Tracing
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

enableProdMode();

registerLocaleData(localeDe, 'de');

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

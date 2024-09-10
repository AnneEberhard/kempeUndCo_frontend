import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';

import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import * as Sentry from "@sentry/angular";


// Sentry.init({
//   dsn: "https://88e9c349e9356205c0baac4c4e17f81b@o4507470803042304.ingest.de.sentry.io/4507917749452880",
//   integrations: [
//     Sentry.browserTracingIntegration(),
//     Sentry.browserProfilingIntegration(),
//     Sentry.replayIntegration(),
//   ],
//   // Tracing
//   tracesSampleRate: 1.0, //  Capture 100% of the transactions
//   // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
//   tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
//   // Session Replay
//   replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
//   replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
//   // Set profilesSampleRate to 1.0 to profile every transaction.
//   // Since profilesSampleRate is relative to tracesSampleRate,
//   // the final profiling rate can be computed as tracesSampleRate * profilesSampleRate
//   // For example, a tracesSampleRate of 0.5 and profilesSampleRate of 0.5 would
//   // results in 25% of transactions being profiled (0.5*0.5=0.25)
//   profilesSampleRate: 1.0,
// });

// enableProdMode();
// platformBrowserDynamic()
//   .bootstrapModule(AppComponent)
//   .catch((err) => console.error(err));
registerLocaleData(localeDe, 'de');

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

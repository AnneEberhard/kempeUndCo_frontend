Falls Sentry Probleme macht, in der main.ts den entsprechenden init auskommentieren

# KempeUndCoFrontend

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.0.6.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

Sentry issue:
added proxy.conf.json
added in angular.json:
    "serve": {
          "options": {
            "proxyConfig": "proxy.conf.json"
          },...}
added in main.ts:
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
    //   replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in     development and then sample at a lower rate in production.
    //   replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to     100% when sampling sessions where errors occur.
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

added in app.config.ts:
    import * as Sentry from "@sentry/angular";
    import { headerInterceptor } from './services/header.interceptor';
    // added here: provideHttpClient(withInterceptors([authInterceptor, headerInterceptor])), causes CORS Error

    as well as:
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

added header.interceptor which causes CORS error

added to ht.access:
    <IfModule mod_headers.c>
    Header set Document-Policy "js-profiling"
    </IfModule>
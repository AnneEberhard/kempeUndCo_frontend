import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

export const headerInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  // Clone the request and add the new header
  const clonedRequest = req.clone({
    setHeaders: {
      // Example header; replace with your own
      "Document-Policy": "js-profiling"
    },
  });

  // Pass the cloned request to the next handler
  return next(clonedRequest);
};

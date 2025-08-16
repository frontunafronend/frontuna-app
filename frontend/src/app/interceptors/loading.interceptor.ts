import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';

import { LoadingService } from '@app/services/shared/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  // Skip loading for certain requests (AI requests use their own professional loaders)
  if (req.url.includes('/health') || 
      req.url.includes('/ping') || 
      req.url.includes('/ai/') ||
      req.url.includes('/prompt')) {
    return next(req);
  }

  loadingService.setLoading(true);

  return next(req).pipe(
    finalize(() => loadingService.setLoading(false))
  );
};
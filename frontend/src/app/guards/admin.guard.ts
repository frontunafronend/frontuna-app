import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map } from 'rxjs/operators';

import { AuthService } from '@app/services/auth/auth.service';
import { NotificationService } from '@app/services/notification/notification.service';

export const AdminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  return authService.currentUser$.pipe(
    map(user => {
      if (user && authService.isAdmin()) {
        return true;
      } else {
        notificationService.showError('Access denied - Admin privileges required');
        router.navigate(['/dashboard']);
        return false;
      }
    })
  );
};
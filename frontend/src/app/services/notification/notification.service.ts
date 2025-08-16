import { Injectable, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly toastr = inject(ToastrService);

  /**
   * Show success notification
   */
  showSuccess(message: string, title?: string): void {
    this.toastr.success(message, title || 'Success');
  }

  /**
   * Show error notification
   */
  showError(message: string, title?: string): void {
    this.toastr.error(message, title || 'Error');
  }

  /**
   * Show warning notification
   */
  showWarning(message: string, title?: string): void {
    this.toastr.warning(message, title || 'Warning');
  }

  /**
   * Show info notification
   */
  showInfo(message: string, title?: string): void {
    this.toastr.info(message, title || 'Info');
  }

  /**
   * Clear all notifications
   */
  clear(): void {
    this.toastr.clear();
  }
}
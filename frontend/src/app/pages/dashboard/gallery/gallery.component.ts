import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

import { ComponentGalleryComponent } from '@app/components/gallery/component-gallery/component-gallery.component';
import { RemixCardComponent } from '@app/components/gallery/remix-card/remix-card.component';
import { GalleryComponent as GalleryComponentModel } from '@app/services/gallery/component-gallery.service';
import { NotificationService } from '@app/services/notification/notification.service';

@Component({
  selector: 'app-gallery-page',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    ComponentGalleryComponent
  ],
  template: `
    <div class="gallery-page">
      <app-component-gallery
        (onComponentPreview)="handlePreview($event)"
        (onComponentRemix)="handleRemix($event)"
        (onComponentUse)="handleUse($event)">
      </app-component-gallery>
    </div>
  `,
  styles: [`
    .gallery-page {
      height: 100vh;
      overflow: hidden;
    }
  `]
})
export class GalleryPageComponent {
  private readonly dialog = inject(MatDialog);
  private readonly notificationService = inject(NotificationService);

  handlePreview(component: GalleryComponentModel) {
    console.log('🎨 Gallery Page: Preview component:', component.displayName);
    // TODO: Open component preview modal
    this.notificationService.showInfo(`Previewing ${component.displayName}`);
  }

  handleRemix(component: GalleryComponentModel) {
    console.log('🎨 Gallery Page: Remix component:', component.displayName);
    
    const dialogRef = this.dialog.open(RemixCardComponent, {
      data: { component },
      width: '95vw',
      height: '90vh',
      maxWidth: '1400px',
      maxHeight: '900px',
      panelClass: 'remix-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'use') {
        this.notificationService.showSuccess(`Remix of ${component.displayName} has been added to your components!`);
      } else if (result?.action === 'playground') {
        // TODO: Navigate to playground with remix result
        this.notificationService.showInfo(`Opening ${component.displayName} remix in playground...`);
      }
    });
  }

  handleUse(component: GalleryComponentModel) {
    console.log('🎨 Gallery Page: Use component:', component.displayName);
    // TODO: Add component to user's library or project
    this.notificationService.showSuccess(`${component.displayName} has been added to your components!`);
  }
}
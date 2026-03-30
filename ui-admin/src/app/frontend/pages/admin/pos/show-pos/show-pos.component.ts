import { Component, OnInit } from '@angular/core';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { stagger40ms } from '@vex/animations/stagger.animation';
import { NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { VexBreadcrumbsComponent } from '@vex/components/vex-breadcrumbs/vex-breadcrumbs.component';
import { VexSecondaryToolbarComponent } from '@vex/components/vex-secondary-toolbar/vex-secondary-toolbar.component';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PosPayload } from 'src/app/backend/payloads/admin/pospayload';
import { PosService } from 'src/app/backend/service/admin/pos.service';
import { AuthService } from 'src/app/backend/service/admin/auth.service';
import { AdminConstants } from 'src/app/backend/service/util/AdminConstants';

@Component({
  selector: 'vex-show-pos',
  standalone: true,
  templateUrl: './show-pos.component.html',
  styleUrl: './show-pos.component.scss',
  animations: [fadeInUp400ms, stagger40ms],
  imports: [
    VexSecondaryToolbarComponent,
    VexBreadcrumbsComponent,
    MatButtonModule,
    MatIconModule,
    NgIf
  ]
})
export class ShowPosComponent implements OnInit {
  payload = new PosPayload();
  id: number;

  constructor(
    private service: PosService,
    private router: Router,
    private route: ActivatedRoute,
    private snackbar: MatSnackBar,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadData();
  }

  loadData(): void {
    this.service.get(this.id).subscribe({
      next: (response: PosPayload) => {
        if (response) {
          this.payload = response;
        }
      },
      error: (e) => {
        this.openSnackBar('error', 'Erreur lors du chargement');
      }
    });
  }

  canEdit(): boolean {
    return this.authService.hasRoles(Array.of(AdminConstants.ADMIN));
  }

  goToEdit(): void {
    this.router.navigate(['pos/edit', this.id]);
  }

  goBack(): void {
    this.router.navigate(['pos']);
  }

  openSnackBar(type: string, message: string) {
    this.snackbar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['snack-' + type]
    });
  }
}

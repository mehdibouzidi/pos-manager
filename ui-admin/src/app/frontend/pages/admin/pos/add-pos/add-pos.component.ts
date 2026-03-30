import {
  Component,
  OnInit
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { stagger40ms } from '@vex/animations/stagger.animation';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NgIf } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { VexBreadcrumbsComponent } from '@vex/components/vex-breadcrumbs/vex-breadcrumbs.component';
import { VexSecondaryToolbarComponent } from '@vex/components/vex-secondary-toolbar/vex-secondary-toolbar.component';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PosPayload } from 'src/app/backend/payloads/admin/pospayload';
import { PosService } from 'src/app/backend/service/admin/pos.service';

@Component({
  selector: 'vex-add-pos',
  standalone: true,
  templateUrl: './add-pos.component.html',
  styleUrl: './add-pos.component.scss',
  animations: [fadeInUp400ms, stagger40ms],
  imports: [
    VexSecondaryToolbarComponent,
    VexBreadcrumbsComponent,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    NgIf,
    ReactiveFormsModule,
    MatSlideToggleModule,
    MatCheckboxModule
  ]
})
export class AddPosComponent implements OnInit {
  generalForm: FormGroup;
  payload = new PosPayload();

  constructor(
    private fb: FormBuilder,
    private service: PosService,
    private router: Router,
    private snackbar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.generalForm = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      address: [''],
      phone: [''],
      email: ['', Validators.email],
      active: [true]
    });
  }

  get f() {
    return this.generalForm.controls;
  }

  add(): void {
    if (this.generalForm.invalid) {
      this.openSnackBar('error', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.payload.code = this.f['code'].value;
    this.payload.name = this.f['name'].value;
    this.payload.address = this.f['address'].value;
    this.payload.phone = this.f['phone'].value;
    this.payload.email = this.f['email'].value;
    this.payload.active = this.f['active'].value;

    this.service.add(this.payload).subscribe({
      next: (response: PosPayload) => {
        if (response != null) {
          this.openSnackBar('success', 'Point de vente créé avec succès');
          this.router.navigate(['pos']);
        }
      },
      error: (e) => {
        this.openSnackBar('error', e.error?.message || 'Erreur lors de la création');
      }
    });
  }

  cancel(): void {
    this.router.navigate(['pos']);
  }

  openSnackBar(type: string, message: string) {
    this.snackbar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['snack-' + type]
    });
  }
}

import { AsyncPipe, CommonModule, NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCommonModule, MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { VexBreadcrumbsComponent } from '@vex/components/vex-breadcrumbs/vex-breadcrumbs.component';
import { VexSecondaryToolbarComponent } from '@vex/components/vex-secondary-toolbar/vex-secondary-toolbar.component';
import { ChangePasswordPayload } from 'src/app/backend/payloads/admin/changepasswordpayload';
import { PrivilegePayload } from 'src/app/backend/payloads/admin/privilegepayload';
import { AuthService } from 'src/app/backend/service/admin/auth.service';
import { PrivilegeService } from 'src/app/backend/service/admin/privilege.service';
import { UserService } from 'src/app/backend/service/admin/user.service';
import { hashPassword } from 'src/app/backend/service/util/password-util';

@Component({
  selector: 'vex-change-password',
  standalone: true,
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss',
  imports: [
    VexSecondaryToolbarComponent,
    VexBreadcrumbsComponent,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    NgIf,
    ReactiveFormsModule,
    MatAutocompleteModule,
    NgFor,
    MatDatepickerModule,
    MatSliderModule,
    MatRadioModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    AsyncPipe,
    MatTableModule
  ]
})
export class ChangePasswordComponent {
  generalForm: FormGroup;
  
    payload = new ChangePasswordPayload();

    
    inputTypeOldPass = 'password';
    visibleOldPass = false;
    
    inputTypeNewPass = 'password';
    visibleNewPass = false;

    inputTypeNewPassConfirmed = 'password';
    visibleNewPassConfirmed = false;
    constructor(
      private fb: FormBuilder,
      private service: UserService,
      private cd: ChangeDetectorRef,
      private snackBar: MatSnackBar,
      private authService: AuthService,
    ) {}
  
  
    async update(): Promise<void> {
      const rawOld = this.f['oldPassword'].value;
      const rawNew = this.f['newPassword'].value;
      const rawConfirm = this.f['newPasswordConfirmed'].value;

      if (rawNew !== rawConfirm) {
        this.openSnackBar('error', 'Nouveau Mot de Passe ne Correspond pas au Mot de Passe Confirmé');
        
        return;
      }

      this.payload.oldPassword = await hashPassword(rawOld);
      this.payload.newPassword = await hashPassword(rawNew);
      this.payload.newPasswordConfirmed = await hashPassword(rawConfirm);

      this.service.updatePassword(this.payload).subscribe({
        next: (response: any) => {
          if (response != null) {
            this.openSnackBar('success', 'Mot de Passe mis à jour avec succès, vous devez vous reconnecter');
            this.authService.logout();
          }
        },
        error: (err) => {
          const errorMessage = err.error || 'Une erreur s\'est produite lors de la mise à jour du mot de passe.';
          this.openSnackBar('error', errorMessage);
        }
      });
    }
  
    ngOnInit(): void {
      this.generalForm = this.fb.group({
        oldPassword: [this.payload.oldPassword,[Validators.required, Validators.maxLength(30)]],
        newPassword: [this.payload.newPassword, [Validators.required, Validators.maxLength(30)]],
        newPasswordConfirmed: [this.payload.newPasswordConfirmed, [Validators.required, Validators.maxLength(30)]],
      });
    }
  
    get f() {
      return this.generalForm.controls;
    }

    toggleVisibilityOldPass() {
      if (this.visibleOldPass) {
        this.inputTypeOldPass = 'password';
        this.visibleOldPass = false;
        this.cd.markForCheck();
      } else {
        this.inputTypeOldPass = 'text';
        this.visibleOldPass = true;
        this.cd.markForCheck();
      }
    }
    
    toggleVisibilityNewPass() {
      if (this.visibleNewPass) {
        this.inputTypeNewPass = 'password';
        this.visibleNewPass = false;
        this.cd.markForCheck();
      } else {
        this.inputTypeNewPass = 'text';
        this.visibleNewPass = true;
        this.cd.markForCheck();
      }
    }

    toggleVisibilityNewPassConfirmed() {
      if (this.visibleNewPassConfirmed) {
        this.inputTypeNewPassConfirmed = 'password';
        this.visibleNewPassConfirmed = false;
        this.cd.markForCheck();
      } else {
        this.inputTypeNewPassConfirmed = 'text';
        this.visibleNewPassConfirmed = true;
        this.cd.markForCheck();
      }
    }
  openSnackBar(type: string, message: string) {
    this.snackBar.open(
      message,
      'Fermer',
      { duration: 8000, panelClass: ['snack-'+type] }
    );
  }
}
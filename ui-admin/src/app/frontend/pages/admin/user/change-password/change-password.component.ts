import { NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { stagger40ms } from '@vex/animations/stagger.animation';
import { VexBreadcrumbsComponent } from '@vex/components/vex-breadcrumbs/vex-breadcrumbs.component';
import { VexSecondaryToolbarComponent } from '@vex/components/vex-secondary-toolbar/vex-secondary-toolbar.component';
import { ChangePasswordPayload } from 'src/app/backend/payloads/admin/changepasswordpayload';
import { AuthService } from 'src/app/backend/service/admin/auth.service';
import { UserService } from 'src/app/backend/service/admin/user.service';

@Component({
  selector: 'vex-change-password',
  standalone: true,
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss',
  animations: [fadeInUp400ms, stagger40ms],
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
    ReactiveFormsModule
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
  
  
    update(): void {
      this.payload.oldPassword = this.f['oldPassword'].value;
      this.payload.newPassword = this.f['newPassword'].value;
      this.payload.newPasswordConfirmed = this.f['newPasswordConfirmed'].value;
      
      if (this.payload.newPassword !== this.payload.newPasswordConfirmed) {
        this.openSnackBar('error', 'Nouveau Mot de Passe ne Correspond pas au Mot de Passe Confirmé');
        
        return;
      }
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
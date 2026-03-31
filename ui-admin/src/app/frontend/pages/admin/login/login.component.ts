import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AuthService } from 'src/app/backend/service/admin/auth.service';
import { LoginPayload } from 'src/app/backend/payloads/admin/loginpayload';
import { LocalStorageService } from 'src/app/backend/service/admin/local-storage.service';
import { UtilStatic } from 'src/app/backend/service/util/UtilStatic';

@Component({
  selector: 'vex-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeInUp400ms],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    NgIf,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatCheckboxModule,
    RouterLink,
    MatSnackBarModule
  ]
})
export class LoginComponent {

  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  inputType = 'password';
  visible = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private snackbar: MatSnackBar,
    private authService: AuthService,
    private lsService: LocalStorageService
  ) {}

  send() {
    let loginPayload = new LoginPayload();
    loginPayload.usernameOrEmail = this.form.value.username;
    loginPayload.password = this.form.value.password;
    loginPayload.storeCodeInput = null;
    this.authService.login(loginPayload).subscribe(
      (response : LoginPayload) => {
        if (response) {
          // Check for error responses
          if (response.errorCode) {
            this.openSnackBar('error', response.errorMessage);
            return;
          }
          
          if(!response.active) {
            this.openSnackBar('error', 'Votre compte est désactivé. Veuillez contacter l\'administrateur.');
            return;
          }
          localStorage.setItem(UtilStatic.TOKEN, response.token);
          localStorage.setItem(UtilStatic.USERNAME, response.usernameOrEmail);
          localStorage.setItem(UtilStatic.PRIVILEGES, JSON.stringify(response.privileges));
          localStorage.setItem(UtilStatic.FIRSTNAME, JSON.stringify(response.firstName));
          localStorage.setItem(UtilStatic.LASTNAME, JSON.stringify(response.lastName));
          
          // Store info
          if (response.storeId) {
            localStorage.setItem(UtilStatic.STORE_ID, response.storeId.toString());
            localStorage.setItem(UtilStatic.STORE_CODE, response.storeCode);
            localStorage.setItem(UtilStatic.STORE_NAME, response.storeName);
          }
          
          // Super admin flag
          localStorage.setItem(UtilStatic.SUPER_ADMIN, String(response.superAdmin || false));

          this.router.navigate(['/']);
          this.openSnackBar('success', 'Bienvenu !');
        } else {
          this.openSnackBar('error', 'Échec de la connexion. Veuillez réessayer.');
        }
      },
      (error) => {
        // Handle HTTP error responses with body
        if (error.error && error.error.errorCode) {
          this.openSnackBar('error', error.error.errorMessage);
        } else if (error.status === 403) {
          this.openSnackBar('error', 'Accès refusé. Vérifiez vos informations ou contactez l\'administrateur.');
        } else if (error.status === 401) {
          this.openSnackBar('error', 'Identifiants incorrects.');
        } else {
          this.openSnackBar('error', 'Une erreur est survenue. Veuillez réessayer plus tard.');
        }
      }
    );
  }

  toggleVisibility() {
    if (this.visible) {
      this.inputType = 'password';
      this.visible = false;
      this.cd.markForCheck();
    } else {
      this.inputType = 'text';
      this.visible = true;
      this.cd.markForCheck();
    }
  }

  openSnackBar(type: string, message: string) {
    this.snackbar.open(message, 'Fermer', { duration: 5000, panelClass: ['snack-'+type] });
  }
}

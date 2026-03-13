import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../backend/service/admin/auth.service';
import { LocalStorageService } from '../../../backend/service/admin/local-storage.service';
import { LoginPayload } from '../../../backend/payloads/admin/loginpayload';
import { UtilStatic } from '../../../backend/service/util/UtilStatic';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private ls = inject(LocalStorageService);
  private router = inject(Router);

  usernameOrEmail = '';
  password = '';
  remember = false;
  showPassword = false;
  loading = signal(false);
  errorMessage = signal('');

  get currentHour(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (!this.usernameOrEmail || !this.password) {
      this.errorMessage.set('Veuillez renseigner tous les champs.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const payload = new LoginPayload();
    payload.usernameOrEmail = this.usernameOrEmail;
    payload.password = this.password;

    this.authService.login(payload).subscribe({
      next: (response: any) => {
        const res = response as LoginPayload;
        this.loading.set(false);
        if (res.token) {
          this.authService.setJwt(res.token);
          this.authService.setUsername(res.usernameOrEmail ?? this.usernameOrEmail);
          this.ls.setItem(UtilStatic.FIRSTNAME, res.firstName);
          this.ls.setItem(UtilStatic.LASTNAME, res.lastName);
          this.ls.setItem(UtilStatic.PRIVILEGES, res.privileges);
          this.ls.setItem(UtilStatic.SUPER_ADMIN, res.superAdmin);
          if (res.storeId) {
            this.ls.setItem(UtilStatic.STORE_ID, res.storeId);
            this.ls.setItem(UtilStatic.STORE_CODE, res.storeCode);
            this.ls.setItem(UtilStatic.STORE_NAME, res.storeName);
          }
          this.router.navigate(['/pos']);
        } else {
          this.errorMessage.set(res.errorMessage ?? 'Identifiants incorrects.');
        }
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Identifiants incorrects ou serveur indisponible.');
      }
    });
  }
}

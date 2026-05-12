import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../backend/service/admin/auth.service';
import { LocalStorageService } from '../../../backend/service/admin/local-storage.service';
import { LoginPayload } from '../../../backend/payloads/admin/loginpayload';
import { UtilStatic } from '../../../backend/service/util/UtilStatic';
import { RequestsConstants } from '../../../backend/service/util/RequestsConstants';

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
  private http = inject(HttpClient);

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

  async onSubmit() {
    if (!this.usernameOrEmail || !this.password) {
      this.errorMessage.set('Veuillez renseigner tous les champs.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const payload = new LoginPayload();
    payload.usernameOrEmail = this.usernameOrEmail;

    try {
      payload.password = await this.authService.encryptPassword(this.password);
    } catch {
      this.loading.set(false);
      this.errorMessage.set('Erreur lors du chiffrement du mot de passe.');
      return;
    }

    this.authService.login(payload).subscribe({
      next: (response: any) => {
        const res = response as LoginPayload;
        this.loading.set(false);
        if (res.tokenExpiry) {
          // Token is in httpOnly cookie — store only session expiry and user info
          this.ls.setItem(UtilStatic.SESSION_EXP, res.tokenExpiry.toString());
          this.authService.setUsername(res.usernameOrEmail ?? this.usernameOrEmail);
          this.ls.setItem(UtilStatic.FIRSTNAME, res.firstName);
          this.ls.setItem(UtilStatic.LASTNAME, res.lastName);
          this.ls.setItem(UtilStatic.PRIVILEGES, res.privileges);
          this.ls.setItem(UtilStatic.SUPER_ADMIN, res.superAdmin);
          if (res.posId) {
            this.ls.setItem(UtilStatic.POS_ID, res.posId);
            this.ls.setItem(UtilStatic.POS_CODE, res.posCode);
            this.ls.setItem(UtilStatic.POS_NAME, res.posName);
            // Fetch and store the API key for offline sync authentication
            this.http.get<any>(RequestsConstants.API_KEY_CURRENT_POS_REQ).subscribe({
              next: (apiKeyPayload) => {
                if (apiKeyPayload?.keyValue) {
                  localStorage.setItem(UtilStatic.API_KEY, apiKeyPayload.keyValue);
                  console.info('[Login] API key stored for offline sync.');
                } else {
                  console.warn('[Login] No active API key found for this POS terminal (204). Configure one in the admin UI.');
                }
              },
              error: (err) => {
                console.warn('[Login] Could not fetch API key:', err);
              }
            });
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

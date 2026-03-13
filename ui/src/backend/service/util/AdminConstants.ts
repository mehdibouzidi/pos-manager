export class AdminConstants {
  static readonly LOGIN = 'login';
  static readonly SIGNIN = 'signin';
  static readonly USER = 'user';
  static readonly DISABLE = 'disable';
  static readonly CHANGE_PASSWORD = 'resetpassword';
  static readonly RESET_PASSWORD = 'RESET_PASSWORD';

  static readonly PRIVILEGE = 'privilege';
  static readonly PROFIL = 'profil';
  static readonly STORE = 'store';
  // Privileges Constants
  static readonly ADMIN = 'ADMIN';

  static readonly PRODUCT_READ = 'PRODUCT_READ';
  static readonly PRODUCT_CREATE = 'PRODUCT_CREATE';
  static readonly PRODUCT_UPDATE = 'PRODUCT_UPDATE';
  static readonly PRODUCT_DELETE = 'PRODUCT_DELETE';

  static readonly STORE_READ = 'STORE_READ';
  static readonly STORE_CREATE = 'STORE_CREATE';
  static readonly STORE_UPDATE = 'STORE_UPDATE';
  static readonly STORE_DELETE = 'STORE_DELETE';

  // SIDE NAV ACCESS
  static readonly SIDENAV_SUPPLY = Array.of(this.ADMIN, this.PRODUCT_READ, this.STORE_READ);
  static readonly SIDENAV_ADMIN = Array.of(this.ADMIN);
}

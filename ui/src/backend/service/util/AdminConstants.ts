export class AdminConstants {
  static readonly LOGIN = 'login';
  static readonly SIGNIN = 'signin';
  static readonly USER = 'user';
  static readonly DISABLE = 'disable';
  static readonly CHANGE_PASSWORD = 'resetpassword';
  static readonly RESET_PASSWORD = 'RESET_PASSWORD';

  static readonly PRIVILEGE = 'privilege';
  static readonly PROFIL = 'profil';
  static readonly POS = 'pos';
  // Privileges Constants
  static readonly ADMIN = 'ADMIN';

  static readonly PRODUCT_READ = 'PRODUCT_READ';
  static readonly PRODUCT_CREATE = 'PRODUCT_CREATE';
  static readonly PRODUCT_UPDATE = 'PRODUCT_UPDATE';
  static readonly PRODUCT_DELETE = 'PRODUCT_DELETE';

  static readonly POS_READ = 'POS_READ';
  static readonly POS_CREATE = 'POS_CREATE';
  static readonly POS_UPDATE = 'POS_UPDATE';
  static readonly POS_DELETE = 'POS_DELETE';

  // SIDE NAV ACCESS
  static readonly SIDENAV_SUPPLY = Array.of(this.ADMIN, this.PRODUCT_READ, this.POS_READ);
  static readonly SIDENAV_ADMIN = Array.of(this.ADMIN);
}

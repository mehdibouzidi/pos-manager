export class AdminConstants {
  static readonly LOGIN = 'login';
  static readonly LOGOUT = 'logout';
  static readonly PUBLIC_KEY = 'public-key';
  static readonly SIGNIN = 'signin';
  static readonly USER = 'user';
  static readonly DISABLE = 'disable';
  static readonly CHANGE_PASSWORD = 'resetpassword';
  static readonly RESET_PASSWORD = 'RESET_PASSWORD';

  static readonly PRIVILEGE = 'privilege';
  static readonly PROFIL = 'profil';
  static readonly POS = 'pos';
  static readonly API_KEY = 'api-key';
  static readonly SESSION_LOG = 'session-log';

  // Privileges Constants
  static readonly ADMIN = 'ADMIN';

  static readonly PRODUCT_READ = 'PRODUCT_READ';
  static readonly PRODUCT_CREATE = 'PRODUCT_CREATE';
  static readonly PRODUCT_UPDATE = 'PRODUCT_UPDATE';
  static readonly PRODUCT_DELETE = 'PRODUCT_DELETE';

  static readonly PRODUCT_CATEGORY_READ = 'PRODUCT_CATEGORY_READ';
  static readonly PRODUCT_CATEGORY_CREATE = 'PRODUCT_CATEGORY_CREATE';
  static readonly PRODUCT_CATEGORY_UPDATE = 'PRODUCT_CATEGORY_UPDATE';
  static readonly PRODUCT_CATEGORY_DELETE = 'PRODUCT_CATEGORY_DELETE';

  static readonly POS_READ = 'POS_READ';
  static readonly POS_CREATE = 'POS_CREATE';
  static readonly POS_UPDATE = 'POS_UPDATE';
  static readonly POS_DELETE = 'POS_DELETE';

  static readonly API_KEY_READ = 'API_KEY_READ';
  static readonly API_KEY_CREATE = 'API_KEY_CREATE';
  static readonly API_KEY_UPDATE = 'API_KEY_UPDATE';
  static readonly API_KEY_DELETE = 'API_KEY_DELETE';

  static readonly SESSION_LOG_READ = 'SESSION_LOG_READ';

  static readonly STOCK_MOVEMENT_READ = 'STOCK_MOVEMENT_READ';
  static readonly STOCK_MOVEMENT_CREATE = 'STOCK_MOVEMENT_CREATE';
  static readonly STOCK_MOVEMENT_UPDATE = 'STOCK_MOVEMENT_UPDATE';
  static readonly STOCK_MOVEMENT_DELETE = 'STOCK_MOVEMENT_DELETE';

  static readonly DASHBOARD_READ = 'DASHBOARD_READ';

  // SIDE NAV ACCESS
  static readonly SIDENAV_CATALOG = Array.of(this.ADMIN, this.PRODUCT_READ, this.PRODUCT_CATEGORY_READ);
  static readonly SIDENAV_ADMIN = Array.of(this.ADMIN);
  static readonly SIDENAV_STOCK = Array.of(this.ADMIN, this.STOCK_MOVEMENT_READ);
  static readonly SIDENAV_DASHBOARD = Array.of(this.ADMIN, this.DASHBOARD_READ);
}

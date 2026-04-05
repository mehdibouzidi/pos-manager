import { HomeComponent } from './frontend/pages/home/home/home.component';
import { AllProductsComponent } from './frontend/pages/supply/product/all-products/all-products.component';
import { ImportProductsComponent } from './frontend/pages/supply/product/import-products/import-products.component';
import { AllProductCategoriesComponent } from './frontend/pages/supply/product-category/all-product-categories/all-product-categories.component';
import { VexRoutes } from '@vex/interfaces/vex-route.interface';
import { LoginComponent } from './frontend/pages/admin/login/login.component';
import { authGuard } from './backend/authguard/guards/auth.guard';
import { AdminConstants } from './backend/service/util/AdminConstants';
import { AllPrivilegesComponent } from './frontend/pages/admin/privilege/all-privileges/all-privileges.component';
import { AllProfilsComponent } from './frontend/pages/admin/profil/all-profils/all-profils.component';
import { AllUsersComponent } from './frontend/pages/admin/user/all-users/all-users.component';
import { AddProfilComponent } from './frontend/pages/admin/profil/add-profil/add-profil.component';
import { EditProfilComponent } from './frontend/pages/admin/profil/edit-profil/edit-profil.component';
import { ShowProfilComponent } from './frontend/pages/admin/profil/show-profil/show-profil.component';
import { AddUserComponent } from './frontend/pages/admin/user/add-user/add-user.component';
import { EditUserComponent } from './frontend/pages/admin/user/edit-user/edit-user.component';
import { ShowUserComponent } from './frontend/pages/admin/user/show-user/show-user.component';
import { ChangePasswordComponent } from './frontend/pages/admin/user/change-password/change-password.component';
import { AllPosComponent } from './frontend/pages/admin/pos/all-pos/all-pos.component';
import { AddPosComponent } from './frontend/pages/admin/pos/add-pos/add-pos.component';
import { EditPosComponent } from './frontend/pages/admin/pos/edit-pos/edit-pos.component';
import { ShowPosComponent } from './frontend/pages/admin/pos/show-pos/show-pos.component';
import { AllApiKeysComponent } from './frontend/pages/admin/api-key/all-api-keys/all-api-keys.component';
import { AllSessionLogsComponent } from './frontend/pages/admin/session-log/all-session-logs/all-session-logs.component';
import { AllStockMovementsComponent } from './frontend/pages/supply/stock-movement/all-stock-movements/all-stock-movements.component';
import { CurrentStockComponent } from './frontend/pages/supply/current-stock/current-stock.component';

export const appRoutes: VexRoutes = [
  {
    path: '',
    component: HomeComponent,
    children: []
  },
  // Auth
  { path: 'login', component: LoginComponent },

  // Catalog - Product Categories
  {
    path: 'product-categories',
    component: AllProductCategoriesComponent,
    canActivate: [authGuard],
    data: { privileges: [AdminConstants.ADMIN, AdminConstants.PRODUCT_CATEGORY_READ] }
  },

  // Catalog - Products
  {
    path: 'products',
    component: AllProductsComponent,
    canActivate: [authGuard],
    data: { privileges: [AdminConstants.ADMIN, AdminConstants.PRODUCT_READ] }
  },
  {
    path: 'products/import',
    component: ImportProductsComponent,
    canActivate: [authGuard],
    data: { privileges: [AdminConstants.ADMIN, AdminConstants.PRODUCT_CREATE] }
  },

  // Admin - Privilege
  {
    path: 'privilege',
    component: AllPrivilegesComponent,
    canActivate: [authGuard],
    data: { privileges: [AdminConstants.ADMIN] }
  },

  // Admin - Profil
  {
    path: 'profil',
    component: AllProfilsComponent,
    canActivate: [authGuard],
    data: { privileges: [AdminConstants.ADMIN] }
  },
  {
    path: 'profil/add',
    component: AddProfilComponent,
    canActivate: [authGuard],
    data: { privileges: [AdminConstants.ADMIN] }
  },
  {
    path: 'profil/edit/:id',
    component: EditProfilComponent,
    canActivate: [authGuard],
    data: { privileges: [AdminConstants.ADMIN] }
  },
  {
    path: 'profil/show/:id',
    component: ShowProfilComponent,
    canActivate: [authGuard],
    data: { privileges: [AdminConstants.ADMIN] }
  },

  // Admin - User
  {
    path: 'user',
    component: AllUsersComponent,
    canActivate: [authGuard],
    data: { privileges: [AdminConstants.ADMIN] }
  },
  {
    path: 'user/add',
    component: AddUserComponent,
    canActivate: [authGuard],
    data: { privileges: [AdminConstants.ADMIN] }
  },
  {
    path: 'user/edit/:id',
    component: EditUserComponent,
    canActivate: [authGuard],
    data: { privileges: [AdminConstants.ADMIN] }
  },
  {
    path: 'user/show/:id',
    component: ShowUserComponent,
    canActivate: [authGuard],
    data: { privileges: [AdminConstants.ADMIN] }
  },
  {
    path: 'changepassword',
    component: ChangePasswordComponent,
    canActivate: [authGuard],
    data: { privileges: [AdminConstants.RESET_PASSWORD] }
  },

  // Admin - POS
  {
    path: 'pos',
    component: AllPosComponent,
    canActivate: [authGuard],
    data: { privileges: [AdminConstants.ADMIN] }
  },
  {
    path: 'pos/add',
    component: AddPosComponent,
    canActivate: [authGuard],
    data: { privileges: [AdminConstants.ADMIN] }
  },
  {
    path: 'pos/edit/:id',
    component: EditPosComponent,
    canActivate: [authGuard],
    data: { privileges: [AdminConstants.ADMIN] }
  },
  {
    path: 'pos/show/:id',
    component: ShowPosComponent,
    canActivate: [authGuard],
    data: { privileges: [AdminConstants.ADMIN] }
  },

  // Admin - API Keys
  {
    path: 'api-keys',
    component: AllApiKeysComponent,
    canActivate: [authGuard],
    data: { privileges: [AdminConstants.ADMIN, AdminConstants.API_KEY_READ] }
  },

  // Admin - Session Logs
  {
    path: 'session-logs',
    component: AllSessionLogsComponent,
    canActivate: [authGuard],
    data: { privileges: [AdminConstants.ADMIN, AdminConstants.SESSION_LOG_READ] }
  },

  // Stock - Stock Movements
  {
    path: 'stock-movements',
    component: AllStockMovementsComponent,
    canActivate: [authGuard],
    data: { privileges: [AdminConstants.ADMIN, AdminConstants.STOCK_MOVEMENT_READ] }
  },

  // Stock - Current Stock
  {
    path: 'current-stock',
    component: CurrentStockComponent,
    canActivate: [authGuard],
    data: { privileges: [AdminConstants.ADMIN, AdminConstants.PRODUCT_READ] }
  }
];

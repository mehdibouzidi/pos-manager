import { Injectable } from '@angular/core';
import { VexLayoutService } from '@vex/services/vex-layout.service';
import { NavigationItem } from './navigation-item.interface';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from 'src/app/backend/service/admin/auth.service';
import { AdminConstants } from 'src/app/backend/service/util/AdminConstants';
import { Router } from '@angular/router';
import { PaginationConstants } from '../../backend/service/util/PaginationConstants';

@Injectable({
  providedIn: 'root'
})
export class NavigationLoaderService {
  private readonly _items: BehaviorSubject<NavigationItem[]> =
    new BehaviorSubject<NavigationItem[]>([]);

  get items$(): Observable<NavigationItem[]> {
    return this._items.asObservable();
  }

  constructor(private readonly layoutService: VexLayoutService, private authService: AuthService, private readonly router: Router) {
    this.loadNavigation();
  }

  loadNavigation(): void {
    this._items.next([
      {
        type: 'subheading',
        label: 'Catalogue',
        visible: this.authService.hasRoles(AdminConstants.SIDENAV_CATALOG),
        children: [
          {
            type: 'link',
            label: 'Produits',
            icon: 'mat:inventory_2',
            route: '/products',
            staticRoute: '/products',
            visible: this.authService.hasRoles(Array.of(AdminConstants.PRODUCT_READ, AdminConstants.ADMIN))
          }
        ]
      },
      {
        type: 'subheading',
        label: 'Administration',
        visible: this.authService.hasRoles(AdminConstants.SIDENAV_ADMIN),
        children: [
          {
            type: 'link',
            label: 'Points de Vente',
            route: '/pos',
            staticRoute: '/pos',
            icon: 'mat:store',
            routerLinkActiveOptions: { exact: true },
            visible: this.authService.hasRoles(Array.of(AdminConstants.ADMIN))
          },
          {
            type: 'link',
            label: 'Privileges',
            route: '/privilege',
            staticRoute: '/privilege',
            icon: 'mat:badge',
            routerLinkActiveOptions: { exact: true },
            visible: this.authService.hasRoles(Array.of(AdminConstants.ADMIN))
          },
          {
            type: 'link',
            label: 'Profils',
            route: '/profil',
            staticRoute: '/profil',
            icon: 'mat:switch_account',
            routerLinkActiveOptions: { exact: true },
            visible: this.authService.hasRoles(Array.of(AdminConstants.ADMIN))
          },
          {
            type: 'link',
            label: 'Utilisateurs',
            route: '/user',
            staticRoute: '/user',
            icon: 'mat:group',
            routerLinkActiveOptions: { exact: true },
            visible: this.authService.hasRoles(Array.of(AdminConstants.ADMIN))
          }
        ]
      }
    ]);
  }

  navigateWithReset(path: string) {
    var indexes = PaginationConstants.getIndexes();
    indexes.forEach(index => {
      sessionStorage.removeItem(index);
    });

    var sizes = PaginationConstants.getSizes();
    sizes.forEach(size => {
      sessionStorage.removeItem(size);
    });

    this.router.navigate([path]);
  }
}

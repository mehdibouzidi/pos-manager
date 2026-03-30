import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  HostBinding,
  inject,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';
import {
  NavigationDropdown,
  NavigationItem,
  NavigationLink
} from '../../../../core/navigation/navigation-item.interface';
import { dropdownAnimation } from '@vex/animations/dropdown.animation';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive
} from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavigationService } from '../../../../core/navigation/navigation.service';

import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'vex-sidenav-item',
  templateUrl: './sidenav-item.component.html',
  styleUrls: ['./sidenav-item.component.scss'],
  animations: [dropdownAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    MatRippleModule,
    RouterLinkActive,
    RouterLink,
    MatIconModule,
    NgClass,
    NgFor
  ]
})
// ...imports (inchangés)
export class SidenavItemComponent implements OnInit, OnChanges {
  @Input({ required: true }) item!: NavigationItem;
  @Input({ required: true }) level!: number;
  isOpen: boolean = false;

  isLink = this.navigationService.isLink;
  isDropdown = this.navigationService.isDropdown;
  isSubheading = this.navigationService.isSubheading;

  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  constructor(
    private router: Router,
    private cd: ChangeDetectorRef,
    private navigationService: NavigationService
  ) {}

  @HostBinding('class')
  get levelClass() {
    return `item-level-${this.level}`;
  }

  get isActiveRoute(): boolean {
    const currentUrl = this.router.url.split('?')[0];

    if (this.isLink(this.item)) {
      const routePath = typeof this.item.route === 'string'
        ? this.item.route
        : (this.item as any).staticRoute;

      if (typeof routePath === 'string') {
        return currentUrl === routePath;
      }
    }

    if (this.isDropdown(this.item)) {
      return (this.item.children || []).some(child => {
        if (this.isLink(child)) {
          const routePath = typeof child.route === 'string'
            ? child.route
            : (child as any).staticRoute;
          return typeof routePath === 'string' && currentUrl.startsWith(routePath);
        }
        return false;
      });
    }



    return false;
  }

  ngOnInit() {
    if (this.isDropdown(this.item)) {
      const currentUrl = this.router.url.split('?')[0];

      this.isOpen =
        this.item.children?.some((child) => {
          if (this.isLink(child)) { // ✅ Vérifie que c’est un lien
            const routePath = typeof child.route === 'string'
              ? child.route
              : (child as any).staticRoute;
            return typeof routePath === 'string' && currentUrl.startsWith(routePath);
          }
          return false;
        }) ?? false;


      this.cd.markForCheck();
    }

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        if (this.isDropdown(this.item)) {
          const currentUrl = this.router.url.split('?')[0];

          this.isOpen =
            this.item.children?.some((child) => {
              if (this.isLink(child)) { // ✅ Vérifie d'abord que l'enfant est un lien
                const routePath = typeof child.route === 'string'
                  ? child.route
                  : (child as any).staticRoute; // ✅ Utilise staticRoute si route est une fonction
                return typeof routePath === 'string' && currentUrl.startsWith(routePath);
              }
              return false;
            }) ?? false;
        }
        this.cd.markForCheck();

      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes &&
      changes.hasOwnProperty('item') &&
      this.isDropdown(this.item)
    ) {
      this.onRouteChange();
    }
  }

  toggleOpen() {
    this.isOpen = !this.isOpen;
    this.navigationService.triggerOpenChange(this.item as NavigationDropdown);
    this.cd.markForCheck()
  }

  onOpenChange(item: NavigationDropdown) {
    if (this.isChildrenOf(this.item as NavigationDropdown, item)) {
      return;
    }

    if (this.hasActiveChilds(this.item as NavigationDropdown)) {
      return;
    }

    if (this.item !== item) {
      this.isOpen = false;
      this.cd.markForCheck();
    }
  }

  onRouteChange() {
    if (this.hasActiveChilds(this.item as NavigationDropdown)) {
      this.isOpen = true;
      this.navigationService.triggerOpenChange(this.item as NavigationDropdown);
      this.cd.markForCheck();
    } else {
      this.isOpen = false;
      this.navigationService.triggerOpenChange(this.item as NavigationDropdown);
      this.cd.markForCheck();
    }
  }

  isChildrenOf(parent: NavigationDropdown, item: NavigationDropdown): boolean {
    if (parent.children.indexOf(item) !== -1) {
      return true;
    }

    return parent.children
      .filter((child) => this.isDropdown(child))
      .some((child) => this.isChildrenOf(child as NavigationDropdown, item));
  }

  hasActiveChilds(parent: NavigationDropdown): boolean {
    return parent.children.some((child) => {
      if (this.isDropdown(child)) {
        return this.hasActiveChilds(child);
      }

      if (this.isLink(child) && !this.isFunction(child.route)) {
        const routePath = typeof child.route === 'string'
          ? child.route
          : (child as any).staticRoute; // ✅ MODIFIÉ
        return typeof routePath === 'string' && this.router.isActive(routePath, false);
      }
      return false;
    });
  }



  isFunction(prop: NavigationLink['route']): boolean {
    return prop instanceof Function;
  }
}

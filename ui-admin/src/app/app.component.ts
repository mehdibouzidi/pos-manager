import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BaseLayoutComponent } from './layouts/base-layout/base-layout.component';
import { AsyncPipe, NgIf, NgTemplateOutlet } from '@angular/common';
import { SidenavComponent } from './layouts/components/sidenav/sidenav.component';
import { ToolbarComponent } from './layouts/components/toolbar/toolbar.component';
import { FooterComponent } from './layouts/components/footer/footer.component';
import { QuickpanelComponent } from './layouts/components/quickpanel/quickpanel.component';
import { ConfigPanelToggleComponent } from './layouts/components/config-panel/config-panel-toggle/config-panel-toggle.component';
import { VexSidebarComponent } from '@vex/components/vex-sidebar/vex-sidebar.component';
import { ConfigPanelComponent } from './layouts/components/config-panel/config-panel.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDrawerMode, MatSidenavModule } from '@angular/material/sidenav';
import { SearchComponent } from './layouts/components/toolbar/search/search.component';
import { VexProgressBarComponent } from '@vex/components/vex-progress-bar/vex-progress-bar.component';
import { combineLatest, map, Observable } from 'rxjs';
import { VexConfig } from '@vex/config/vex-config.interface';
import { VexLayoutService } from '@vex/services/vex-layout.service';
import { VexConfigService } from '@vex/config/vex-config.service';
import { Router } from '@angular/router';

@Component({
  selector: 'vex-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [
    BaseLayoutComponent,
    NgIf,
    AsyncPipe,
    SidenavComponent,
    ToolbarComponent,
    FooterComponent,
    QuickpanelComponent,
    ConfigPanelToggleComponent,
    VexSidebarComponent,
    ConfigPanelComponent,
    MatDialogModule,
    MatSidenavModule,
    NgTemplateOutlet,
    RouterOutlet,
    SearchComponent,
    VexProgressBarComponent
  ],
})
export class AppComponent {
  config$: Observable<VexConfig> = this.configService.config$;
  sidenavCollapsed$: Observable<boolean> = this.layoutService.sidenavCollapsed$;
  sidenavDisableClose$: Observable<boolean> = this.layoutService.isDesktop$;
  sidenavFixedInViewport$: Observable<boolean> =
    this.layoutService.isDesktop$.pipe(map((isDesktop) => !isDesktop));
  sidenavMode$: Observable<MatDrawerMode> = combineLatest([
    this.layoutService.isDesktop$,
    this.configService.select((config) => config.layout)
  ]).pipe(
    map(([isDesktop, layout]) =>
      !isDesktop || layout === 'vertical' ? 'over' : 'side'
    )
  );
  sidenavOpen$: Observable<boolean> = this.layoutService.sidenavOpen$;
  configPanelOpen$: Observable<boolean> = this.layoutService.configPanelOpen$;
  quickpanelOpen$: Observable<boolean> = this.layoutService.quickpanelOpen$;
  
  hideLayoutRoutes = ['/login', '/register', '/error-404'];

  shouldHideLayout(): boolean {
    return this.hideLayoutRoutes.some(route => this.router.url.startsWith(route));
  }
  
  constructor(
    private readonly layoutService: VexLayoutService,
    private readonly configService: VexConfigService,
    public router: Router
  ) {}

  onSidenavClosed(): void {
    this.layoutService.closeSidenav();
  }

  onQuickpanelClosed(): void {
    this.layoutService.closeQuickpanel();
  }
}

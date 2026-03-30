import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { MenuItem } from '../interfaces/menu-item.interface';
import { trackById } from '@vex/utils/track-by';
import { VexPopoverRef } from '@vex/components/vex-popover/vex-popover-ref';
import { RouterLink } from '@angular/router';
import { MatRippleModule } from '@angular/material/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UtilStatic } from 'src/app/backend/service/util/UtilStatic';
import { AuthService } from 'src/app/backend/service/admin/auth.service';

export interface OnlineStatus {
  id: 'online' | 'away' | 'dnd' | 'offline';
  label: string;
  icon: string;
  colorClass: string;
}

@Component({
  selector: 'vex-toolbar-user-dropdown',
  templateUrl: './toolbar-user-dropdown.component.html',
  styleUrls: ['./toolbar-user-dropdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatMenuModule,
    NgFor,
    MatRippleModule,
    RouterLink,
    NgClass,
    NgIf
  ]
})
export class ToolbarUserDropdownComponent implements OnInit {
  
  firstName: string | null = localStorage.getItem(UtilStatic.FIRSTNAME).replace(/"/g, '');
  lastName: string | null = localStorage.getItem(UtilStatic.LASTNAME).replace(/"/g, '');
  
  items: MenuItem[] = [
    {
      id: '1',
      icon: 'mat:lock',
      label: 'Reset Mot de Passe',
      description: 'Securité',
      colorClass: 'text-teal-600',
      route: '/changepassword'
    }
  ];


  trackById = trackById;

  constructor(
    private cd: ChangeDetectorRef,
    private popoverRef: VexPopoverRef<ToolbarUserDropdownComponent>,
    private authService: AuthService
  ) {}

  ngOnInit() {}

  logout() {
    this.popoverRef.close();
    this.authService.logout();

  }
  close() {
    this.popoverRef.close();
  }
}

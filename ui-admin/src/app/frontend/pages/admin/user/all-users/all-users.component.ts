import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormControl
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { VexBreadcrumbsComponent } from '@vex/components/vex-breadcrumbs/vex-breadcrumbs.component';
import { VexPageLayoutContentDirective } from '@vex/components/vex-page-layout/vex-page-layout-content.directive';
import { VexPageLayoutHeaderDirective } from '@vex/components/vex-page-layout/vex-page-layout-header.directive';
import { VexPageLayoutComponent } from '@vex/components/vex-page-layout/vex-page-layout.component';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent
} from '@angular/material/paginator';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { SelectionModel } from '@angular/cdk/collections';
import { TableColumn } from '@vex/interfaces/table-column.interface';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { stagger40ms } from '@vex/animations/stagger.animation';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalPayload } from 'src/app/backend/payloads/global/globalpayload';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DeleteConfirmationDialogComponent } from 'src/app/frontend/common/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { AuthService } from 'src/app/backend/service/admin/auth.service';
import { UserPayload } from 'src/app/backend/payloads/admin/userpayload';
import { AdminConstants } from 'src/app/backend/service/util/AdminConstants';
import { UserService } from 'src/app/backend/service/admin/user.service';
import { UserCriteria } from 'src/app/backend/criteria/admin/usercriteria';
import { DisableConfirmationDialogComponent } from 'src/app/frontend/common/disable-confirmation-dialog/disable-confirmation-dialog.component';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'vex-all-users',
  standalone: true,
  templateUrl: './all-users.component.html',
  styleUrl: './all-users.component.scss',
  animations: [fadeInUp400ms, stagger40ms],
  imports: [
    VexPageLayoutComponent,
    VexPageLayoutHeaderDirective,
    VexBreadcrumbsComponent,
    MatButtonToggleModule,
    ReactiveFormsModule,
    VexPageLayoutContentDirective,
    NgIf,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatMenuModule,
    MatTableModule,
    MatSortModule,
    NgFor,
    NgClass,
    MatPaginatorModule,
    FormsModule,
    MatDialogModule,
    MatCheckboxModule,
    MatInputModule,
    MatProgressBarModule,
    MatSnackBarModule,
    CommonModule,
    MatDatepickerModule,
    MatAutocompleteModule
  ]
})
export class AllUsersComponent {
//Back Variables
  criteria = new UserCriteria();
  globalPayload = new GlobalPayload<UserPayload>();

  //------------Initialization
  constructor(
    private service: UserService,
    private router: Router,
    private liveAnnouncer: LiveAnnouncer,
    public dialog: MatDialog,
    public authService: AuthService,
    private route: ActivatedRoute
  ) {}

  canCreate(): boolean {
    return this.authService.hasRoles(Array.of(AdminConstants.ADMIN));
  }
  canEdit(): boolean {
    return this.authService.hasRoles(Array.of(AdminConstants.ADMIN));
  }
  canDisable(): boolean {
    return this.authService.hasRoles(Array.of(AdminConstants.ADMIN));
  }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource<UserPayload>();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.search();
  }
  checkCriteria() {
    this.criteria.firstName = this.criteria.firstName == '' ? null : this.criteria.firstName;
    this.criteria.lastName = this.criteria.lastName == '' ? null : this.criteria.lastName;
    this.criteria.pages = 0;
  }

  findByCriteria() {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.service.findAllByCriteria(this.criteria)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response: GlobalPayload<UserPayload>) => {
        if (response != null) {
          this.globalPayload = response;
          this.dataSource = new MatTableDataSource<UserPayload>(
            this.globalPayload.elements
          );
        }
      },
      error: () => {}
    });
  }

  search() {
    this.checkCriteria();
    this.findByCriteria();
  }

  //delete shoulb be replaced by deactivate
  disable(id: number) {
    if (!this.canDisable()) {
      return;
    }
    const payload = new UserPayload();
    payload.id = id;
    const dialogRef = this.dialog.open(DisableConfirmationDialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.service.disable(payload).subscribe({
          next: (response: boolean) => {
            if (response) {
              this.search();
            }
          },
          error: () => {
            // Handle error appropriately
          }
        });
      }
    });
  }

  /******************************************************UI INITIALIZATION*********************************************************************/

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  layoutCtrl = new UntypedFormControl('fullwidth');
  isLoading = false;

  dataSource = new MatTableDataSource<UserPayload>();
  selection = new SelectionModel<UserPayload>(true, []);

  @Input()
  columns: TableColumn<UserPayload>[] = [
    {
      label: 'Nom',
      property: 'lastName',
      type: 'text',
      visible: true
    },
    {
      label: 'Prénom',
      property: 'firstName',
      type: 'text',
      visible: true
    },
    {
      label: 'Nom d\'Utilisateur',
      property: 'username',
      type: 'text',
      visible: true
    },
    {
      label: 'Actif',
      property: 'active',
      type: 'boolean',
      visible: true
    },
    {
      label: 'Créé le',
      property: 'createdAt',
      type: 'text',
      visible: false,
      cssClasses: ['font-medium']
    },
    {
      label: 'Modifié le',
      property: 'updatedAt',
      type: 'text',
      visible: false,
      cssClasses: ['font-medium']
    },
    {
      label: 'Créé par',
      property: 'createdByFullName',
      type: 'text',
      visible: false
    },
    {
      label: 'Modifié par',
      property: 'updatedByFullName',
      type: 'text',
      visible: false
    },
    {
      label: 'Actions',
      property: 'actions',
      type: 'button',
      visible: true
    }
  ];

  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50];

  toggleColumnVisibility(column: TableColumn<UserPayload>, event: Event) {
    event.stopPropagation();
    event.stopImmediatePropagation();
    column.visible = !column.visible;
  }

  get visibleColumns() {
    return this.columns
      .filter((column) => column.visible)
      .map((column) => column.property);
  }

  trackByProperty<T>(index: number, column: TableColumn<T>) {
    return column.property;
  }

  onFilterChange(value: string) {
    if (!this.dataSource) {
      return;
    }
    value = value.trim();
    value = value.toLowerCase();
    this.dataSource.filter = value;
  }

  announceSortChange(sortState: Sort) {
    this.criteria.sortColumn = sortState.active;
    this.criteria.sort = sortState.direction;
    this.search();
    this.liveAnnouncer.announce(
      sortState.direction
        ? `Sorted ${sortState.direction}ending`
        : 'Sorting cleared'
    );
  }

  onPaginationChange(event?: PageEvent) {
    this.criteria.pages = event?.pageIndex;
    this.criteria.size = event?.pageSize;
    this.search();
    return event;
  }

  goToAdd(): void {
      this.router.navigate(['./add'], {
        relativeTo: this.route,
      });
    }
  
    goToEdit(element: UserPayload) {
      this.router.navigate(['./edit', element.id], {
        relativeTo: this.route,
      });
    }
  
    goToShow(element: UserPayload) {
      this.router.navigate(['./show', element.id], {
        relativeTo: this.route,
      });
    }
}

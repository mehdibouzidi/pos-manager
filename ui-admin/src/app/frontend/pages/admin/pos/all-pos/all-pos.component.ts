import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule
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
import { MatSort, MatSortModule } from '@angular/material/sort';
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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalPayload } from 'src/app/backend/payloads/global/globalpayload';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DeleteConfirmationDialogComponent } from 'src/app/frontend/common/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { AuthService } from 'src/app/backend/service/admin/auth.service';
import { AdminConstants } from 'src/app/backend/service/util/AdminConstants';
import { PosCriteria } from 'src/app/backend/criteria/admin/poscriteria';
import { PosPayload } from 'src/app/backend/payloads/admin/pospayload';
import { PosService } from 'src/app/backend/service/admin/pos.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'vex-all-pos',
  standalone: true,
  templateUrl: './all-pos.component.html',
  styleUrl: './all-pos.component.scss',
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
export class AllPosComponent implements OnInit {
  // Back Variables
  criteria = new PosCriteria();
  globalPayload = new GlobalPayload<PosPayload>();

  // Table Variables
  dataSource: MatTableDataSource<PosPayload>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  selection = new SelectionModel<PosPayload>(true, []);
  isLoading = false;

  displayedColumns: string[] = ['code', 'name', 'address', 'phone', 'email', 'active', 'actions'];

  columns: TableColumn<PosPayload>[] = [
    { label: 'Code', property: 'code', type: 'text', visible: true },
    { label: 'Nom', property: 'name', type: 'text', visible: true },
    { label: 'Adresse', property: 'address', type: 'text', visible: true },
    { label: 'Téléphone', property: 'phone', type: 'text', visible: true },
    { label: 'Email', property: 'email', type: 'text', visible: true },
    { label: 'Actif', property: 'active', type: 'text', visible: true },
    { label: 'Actions', property: 'actions', type: 'button', visible: true }
  ];

  constructor(
    private service: PosService,
    private router: Router,
    private liveAnnouncer: LiveAnnouncer,
    public dialog: MatDialog,
    public authService: AuthService,
    private snackbar: MatSnackBar,
    private route: ActivatedRoute
  ) {}

  canCreate(): boolean {
    return this.authService.hasRoles(Array.of(AdminConstants.ADMIN));
  }
  canEdit(): boolean {
    return this.authService.hasRoles(Array.of(AdminConstants.ADMIN));
  }
  canDelete(): boolean {
    return this.authService.hasRoles(Array.of(AdminConstants.ADMIN));
  }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource<PosPayload>();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.search();
  }

  checkCriteria() {
    this.criteria.name = this.criteria.name == '' ? null : this.criteria.name;
    this.criteria.code = this.criteria.code == '' ? null : this.criteria.code;
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
        next: (response: GlobalPayload<PosPayload>) => {
          if (response != null) {
            this.globalPayload = response;
            this.dataSource = new MatTableDataSource<PosPayload>(
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

  delete(id: number) {
    if (!this.canDelete()) {
      return;
    }
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.service.delete(id).subscribe({
          next: (res) => {
            this.openSnackBar('success', 'Point de vente supprimé avec succès');
            this.search();
          },
          error: (e) => {
            this.openSnackBar('error', 'Erreur lors de la suppression');
          }
        });
      }
    });
  }

  goToAdd() {
    this.router.navigate(['pos/add']);
  }

  goToEdit(id: number) {
    this.router.navigate(['pos/edit', id]);
  }

  goToShow(id: number) {
    this.router.navigate(['pos/show', id]);
  }

  pageChange(event: PageEvent) {
    this.criteria.pages = event.pageIndex;
    this.criteria.size = event.pageSize;
    this.findByCriteria();
  }

  openSnackBar(type: string, message: string) {
    this.snackbar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['snack-' + type]
    });
  }
}

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  UntypedFormControl,
  Validators
} from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { stagger40ms, stagger60ms } from '@vex/animations/stagger.animation';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatRadioModule } from '@angular/material/radio';
import { MatSliderModule } from '@angular/material/slider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { VexBreadcrumbsComponent } from '@vex/components/vex-breadcrumbs/vex-breadcrumbs.component';
import { VexSecondaryToolbarComponent } from '@vex/components/vex-secondary-toolbar/vex-secondary-toolbar.component';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UtilStatic } from 'src/app/backend/service/util/UtilStatic';
import { GlobalPayload } from 'src/app/backend/payloads/global/globalpayload';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ProfilPayload } from 'src/app/backend/payloads/admin/profilpayload';
import { PrivilegePayload } from 'src/app/backend/payloads/admin/privilegepayload';
import { ProfilService } from 'src/app/backend/service/admin/profil.service';
import { PrivilegeService } from 'src/app/backend/service/admin/privilege.service';

@Component({
  selector: 'vex-edit-profil',
  standalone: true,
  templateUrl: './edit-profil.component.html',
  styleUrl: './edit-profil.component.scss',
  animations: [fadeInUp400ms, stagger40ms],
  imports: [
    VexSecondaryToolbarComponent,
    VexBreadcrumbsComponent,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    NgIf,
    ReactiveFormsModule,
    MatAutocompleteModule,
    NgFor,
    MatDatepickerModule,
    MatSliderModule,
    MatRadioModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    AsyncPipe,
    MatTableModule
  ]
})
export class EditProfilComponent {
  generalForm: FormGroup;

  payload = new ProfilPayload();
  privileges: Array<PrivilegePayload>;

  privilegeControl = new FormControl();
  filteredPrivileges: Observable<any[]>;

  categoryControl = new FormControl();
  filteredCategories: Observable<any[]>;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private service: ProfilService,
    private privilegeService: PrivilegeService,
    private router: Router,
    public dialog: MatDialog,
    private snackbar: MatSnackBar
  ) {
    var id = +this.route.snapshot.paramMap.get('id');

    this.service.get(id).subscribe({
      next: (data: ProfilPayload) => {
        this.payload = data;
        this.patchValues();
        this.initData();
      },
      error: () => {} // Handle error appropriately
    });
  }

  patchValues() {
    this.f['name'].setValue(this.payload.name);
    this.f['code'].setValue(this.payload.code);
    this.profilPrivileges = this.payload.privileges;
    this.dataSource.data = this.profilPrivileges;
  }

  edit(): void {
    this.payload.name = this.f['name'].value;
    this.payload.code = this.f['code'].value;

    this.profilPrivileges = this.profilPrivileges.filter(
      (privilege) => privilege !== null
    );
    this.payload.privileges = this.profilPrivileges;

    this.service.update(this.payload).subscribe({
      next: (response: PrivilegePayload) => {
        if (response != null) {
          console.log('Profil Added');
          this.router.navigate(['profil']);
        }
      },
      error: (e) => {
        this.openSnackBar('error', e.error.message);
      }
    });
  }

  initData() {
    this.privilegeService.findAll().subscribe({
      next: (response: Array<PrivilegePayload>) => {
        if (response != null) {
          this.privileges = response;
          this.privileges = this.privileges.filter(
            (elt) => !this.profilPrivileges.some((privilege) => privilege.id == elt.id)
          );
          
          this.filteredPrivileges = this.privilegeControl.valueChanges.pipe(
            startWith(''),
            map((value) => (typeof value === 'string' ? value : value.name)),
            map((name) =>
              name ? this._filterPrivileges(name) : this.privileges.slice()
            )
          );
        }
      },
      error: () => {}
    });
  }

  initForm() {
    this.generalForm = this.fb.group({
      name: [
        this.payload.name,
        [Validators.required, Validators.maxLength(100)]
      ],
      code: [this.payload.code, [Validators.required, Validators.maxLength(30)]]
    });
  }

  ngOnInit(): void {
    this.initData();
    this.initForm();
    this.setupTable();
    this.dataSource.data = this.profilPrivileges;
    this.initObservables();
  }

  get f() {
    return this.generalForm.controls;
  }

  displayPrivilegeName(privilege?: PrivilegePayload): string | undefined {
    return privilege ? privilege.code + ' | ' + privilege.name : undefined;
  }

  private _filterPrivileges(value: string): PrivilegePayload[] {
    const filterValue = value.toLowerCase();
    return this.privileges.filter((option) =>
      option.name.toLowerCase().includes(filterValue)
    );
  }

  /************************ Privileges Table Management*********************************/
  displayedColumns = ['code', 'name', 'actions'];

  profilPrivileges: Array<PrivilegePayload> = [];
  privilege: PrivilegePayload;

  dataSource = new MatTableDataSource<PrivilegePayload>();
  @Input() totalNumberOfElements: number;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  addPrivilege() {
    if (this.privilege && this.privilege.id) {
      this.profilPrivileges.push(this.privilege);
      this.dataSource.data = this.profilPrivileges;
      this.privileges = this.privileges.filter(
        (elt) => elt.id != this.privilege.id
      );

      this.resetPrivilegeAutocomplete();
    } else {
      this.openSnackBar('warning', 'Veuillez selectionner un privilege');
    }
  }

  deletePrivilege(element) {
    console.log('DELETE METHOD');
    console.log(element);
    this.profilPrivileges = this.profilPrivileges.filter(
      (elt) => elt.id != element.id
    );
    this.dataSource.data = this.profilPrivileges;
    this.privileges.push(element);
    this.resetPrivilegeAutocomplete();
  }

  resetPrivilegeAutocomplete() {
    this.filteredPrivileges = this.privilegeControl.valueChanges.pipe(
      startWith(''),
      map((value) => (typeof value === 'string' ? value : value.name)),
      map((name) =>
        name ? this._filterPrivileges(name) : this.privileges.slice()
      )
    );
    this.privilege = null;
    this.privilegeControl.setValue(null);
  }

  setupTable() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  initObservables() {
    this.privilegeControl.valueChanges.subscribe((value) => {
      this.privilege = value;
    });

    this.categoryControl.valueChanges.subscribe((value) => {
      this.generalForm.get('category').setValue(value);
    });
  }

  openSnackBar(type: string, message: string) {
    this.snackbar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['snack-' + type]
    });
  }
}

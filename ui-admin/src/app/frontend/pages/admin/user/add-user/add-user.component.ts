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
import { first, map, startWith } from 'rxjs/operators';
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
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UtilStatic } from 'src/app/backend/service/util/UtilStatic';
import { GlobalPayload } from 'src/app/backend/payloads/global/globalpayload';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { UserPayload } from 'src/app/backend/payloads/admin/userpayload';
import { UserService } from 'src/app/backend/service/admin/user.service';
import { ProfilPayload } from 'src/app/backend/payloads/admin/profilpayload';
import { ProfilService } from 'src/app/backend/service/admin/profil.service';
import { AuthService } from 'src/app/backend/service/admin/auth.service';
import { PosPayload } from 'src/app/backend/payloads/admin/pospayload';
import { PosService } from 'src/app/backend/service/admin/pos.service';


@Component({
  selector: 'vex-add-user',
  standalone: true,
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.scss',
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
export class AddUserComponent {
  inputType = 'password';
  visible = false;

  toggleVisibility() {
    if (this.visible) {
      this.inputType = 'password';
      this.visible = false;
      this.cd.markForCheck();
    } else {
      this.inputType = 'text';
      this.visible = true;
      this.cd.markForCheck();
    }
  }

  generalForm: FormGroup;

  payload = new UserPayload();
  profils: Array<ProfilPayload>;
  poses: Array<PosPayload> = [];

  profilControl = new FormControl();
  filteredProfils: Observable<any[]>;

  posControl = new FormControl();
  filteredPoses: Observable<any[]>;
  selectedPos: PosPayload;

  categoryControl = new FormControl();
  filteredCategories: Observable<any[]>;

  constructor(
    private cd: ChangeDetectorRef,
    private fb: FormBuilder,
    private service: AuthService,
    private privilegeService: ProfilService,
    private posService: PosService,
    private router: Router,
    public dialog: MatDialog,
    private snackbar: MatSnackBar
  ) {}

  add(): void {
    this.payload.lastName = this.f['lastName'].value;
    this.payload.firstName = this.f['firstName'].value;
    this.payload.username = this.f['username'].value;
    this.payload.password = this.f['password'].value;

    this.userProfils = this.userProfils.filter(
      (privilege) => privilege !== null
    );

    this.payload.profils = this.userProfils;
    
    // Add pos info
    if (this.selectedPos) {
      this.payload.storeId = this.selectedPos.id;
      this.payload.storeCode = this.selectedPos.code;
    }
    
    // Super admin flag
    this.payload.superAdmin = this.f['superAdmin'].value || false;

    this.service.signin(this.payload).subscribe({
      next: (response: ProfilPayload) => {
        if (response != null) {
          this.router.navigate(['user']);
        }
      },
      error: (e) => {
        this.openSnackBar('error', e.error.message);
      }
    });
  }

  initData() {
    this.privilegeService.findAll().subscribe({
      next: (response: Array<ProfilPayload>) => {
        if (response != null) {
          this.profils = response;
          this.filteredProfils = this.profilControl.valueChanges.pipe(
            startWith(''),
            map((value) => (typeof value === 'string' ? value : value.name)),
            map((name) =>
              name ? this._filterProfils(name) : this.profils.slice()
            )
          );
        }
      },
      error: () => {}
    });
    
    // Load poses
    this.posService.findAll().subscribe({
      next: (response: Array<PosPayload>) => {
        if (response != null) {
          this.poses = response.filter(s => s.active);
          this.filteredPoses = this.posControl.valueChanges.pipe(
            startWith(''),
            map((value) => (typeof value === 'string' ? value : value?.name || '')),
            map((name) =>
              name ? this._filterPoses(name) : this.poses.slice()
            )
          );
        }
      },
      error: () => {}
    });
  }

  initForm() {
    this.generalForm = this.fb.group({
      lastName: [
        this.payload.lastName,
        [Validators.required, Validators.maxLength(100)]
      ],
      firstName: [this.payload.firstName, [Validators.required, Validators.maxLength(100)]],
      username: [this.payload.username, [Validators.required, Validators.maxLength(100)]],
      password: [this.payload.password, [Validators.required, Validators.maxLength(100)]],
      superAdmin: [false]
    });
  }

  ngOnInit(): void {
    this.initData();
    this.initForm();
    this.setupTable();
    this.dataSource.data = this.userProfils;
    this.initObservables();
  }

  get f() {
    return this.generalForm.controls;
  }

  displayProfilName(profil?: ProfilPayload): string | undefined {
    return profil ? profil.code + ' | ' + profil.name : undefined;
  }

  private _filterProfils(value: string): ProfilPayload[] {
    const filterValue = value.toLowerCase();
    return this.profils.filter((option) =>
      option.name.toLowerCase().includes(filterValue)
    );
  }

  private _filterPoses(value: string): PosPayload[] {
    const filterValue = value.toLowerCase();
    return this.poses.filter((option) =>
      option.name.toLowerCase().includes(filterValue) ||
      option.code.toLowerCase().includes(filterValue)
    );
  }

  displayPosName(pos?: PosPayload): string | undefined {
    return pos ? pos.code + ' | ' + pos.name : undefined;
  }

  /************************ Profils Table Management*********************************/
  displayedColumns = ['code', 'name', 'actions'];

  userProfils: Array<ProfilPayload> = [];
  profil: ProfilPayload;

  dataSource = new MatTableDataSource<ProfilPayload>();
  @Input() totalNumberOfElements: number;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  addProfil() {
    if (this.profil && this.profil.id) {
      this.userProfils.push(this.profil);
      this.dataSource.data = this.userProfils;
      this.profils = this.profils.filter(
        (elt) => elt.id != this.profil.id
      );

      this.resetProfilAutocomplete();
    } else {
      this.openSnackBar('warning', 'Veuillez selectionner un Profil');
    }
  }

  deleteProfil(element) {

    this.userProfils = this.userProfils.filter(
      (elt) => elt.id != element.id
    );
    this.dataSource.data = this.userProfils;
    this.profils.push(element);
    this.resetProfilAutocomplete();
  }

  resetProfilAutocomplete() {
    this.filteredProfils = this.profilControl.valueChanges.pipe(
      startWith(''),
      map((value) => (typeof value === 'string' ? value : value.name)),
      map((name) =>
        name ? this._filterProfils(name) : this.profils.slice()
      )
    );
    this.profil = null;
    this.profilControl.setValue(null);
  }

  setupTable() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  initObservables() {
    this.profilControl.valueChanges.subscribe((value) => {
      this.profil = value;
    });

    this.categoryControl.valueChanges.subscribe((value) => {
      this.generalForm.get('category').setValue(value);
    });
    
    this.posControl.valueChanges.subscribe((value) => {
      if (value && typeof value === 'object') {
        this.selectedPos = value;
      }
    });
  }

  openSnackBar(type: string, message: string) {
    this.snackbar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['snack-' + type]
    });
  }
}

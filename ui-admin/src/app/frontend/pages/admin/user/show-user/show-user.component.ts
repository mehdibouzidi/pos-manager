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
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UtilStatic } from 'src/app/backend/service/util/UtilStatic';
import { GlobalPayload } from 'src/app/backend/payloads/global/globalpayload';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { UserPayload } from 'src/app/backend/payloads/admin/userpayload';
import { UserService } from 'src/app/backend/service/admin/user.service';
import { ProfilPayload } from 'src/app/backend/payloads/admin/profilpayload';
import { ProfilService } from 'src/app/backend/service/admin/profil.service';
import { AuthService } from 'src/app/backend/service/admin/auth.service';

@Component({
  selector: 'vex-show-user',
  standalone: true,
  templateUrl: './show-user.component.html',
  styleUrl: './show-user.component.scss',
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
    MatTableModule,
    MatChipsModule
  ]
})
export class ShowUserComponent {

  generalForm: FormGroup;

  payload = new UserPayload();
  profils: Array<ProfilPayload>;

  profilControl = new FormControl();
  filteredProfils: Observable<any[]>;

  constructor(
    private cd: ChangeDetectorRef,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private service: UserService,
    public dialog: MatDialog,
    private snackbar: MatSnackBar
  ) {

      var id = +this.route.snapshot.paramMap.get('id');
      
          this.service.get(id).subscribe({
            next: (data: UserPayload) => {
              this.payload = data;
              this.patchValues();
            },
            error: () => {}, // Handle error appropriately
          });
  }

  patchValues() {
    this.f['lastName'].setValue(this.payload.lastName);
    this.f['firstName'].setValue(this.payload.firstName);
    this.f['username'].setValue(this.payload.username);
    this.userProfils = this.payload.profils;
    this.dataSource.data = this.userProfils;
  }

  initForm() {
    this.generalForm = this.fb.group({
      lastName: [
        { value: this.payload.lastName, disabled: true },
        [Validators.required, Validators.maxLength(100)]
      ],
      firstName: [{ value: this.payload.firstName, disabled: true }, [Validators.required, Validators.maxLength(100)]],
      username: [{ value: this.payload.username, disabled: true }, [Validators.required, Validators.maxLength(100)]],
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.setupTable();
    this.dataSource.data = this.userProfils;
    this.initObservables();
  }

  get f() {
    return this.generalForm.controls;
  }

  displayProfilName(privilege?: ProfilPayload): string | undefined {
    return privilege ? privilege.code + ' | ' + privilege.name : undefined;
  }


  /************************ Profils Table Management*********************************/
  displayedColumns = ['code', 'name'];

  userProfils: Array<ProfilPayload> = [];
  privilege: ProfilPayload;

  dataSource = new MatTableDataSource<ProfilPayload>();
  @Input() totalNumberOfElements: number;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;


  

  setupTable() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  initObservables() {
    this.profilControl.valueChanges.subscribe((value) => {
      this.privilege = value;
    });

  }

  openSnackBar(type: string, message: string) {
    this.snackbar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['snack-' + type]
    });
  }
}

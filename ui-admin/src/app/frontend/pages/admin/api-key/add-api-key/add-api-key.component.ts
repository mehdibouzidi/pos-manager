import { AsyncPipe, CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCommonModule, MatOptionModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ApiKeyPayload } from 'src/app/backend/payloads/admin/api-key-payload';
import { PosPayload } from 'src/app/backend/payloads/admin/pospayload';
import { ApiKeyService } from 'src/app/backend/service/admin/api-key.service';
import { PosService } from 'src/app/backend/service/admin/pos.service';

@Component({
  selector: 'vex-add-api-key',
  standalone: true,
  templateUrl: './add-api-key.component.html',
  styleUrl: './add-api-key.component.scss',
  imports: [
    ReactiveFormsModule, MatDialogModule, NgIf, NgFor, MatButtonModule,
    MatIconModule, MatDividerModule, MatFormFieldModule, MatInputModule,
    MatCommonModule, MatOptionModule, CommonModule, MatSlideToggleModule,
    MatAutocompleteModule, AsyncPipe
  ]
})
export class AddApiKeyComponent implements OnInit {
  generalForm: FormGroup;
  payload = new ApiKeyPayload();

  posControl = new FormControl();
  poses: PosPayload[] = [];
  filteredPoses: Observable<PosPayload[]>;
  selectedPos: PosPayload;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddApiKeyComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private service: ApiKeyService,
    private posService: PosService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadPoses();
  }

  get f() { return this.generalForm.controls; }

  close(): void { this.dialogRef.close(); }

  add(): void {
    if (this.generalForm.invalid || !this.selectedPos) return;
    this.payload.description = this.f['description'].value;
    this.payload.active = this.f['active'].value;
    this.payload.posId = this.selectedPos.id;
    this.service.add(this.payload).subscribe({
      next: (response: ApiKeyPayload) => {
        if (response != null) this.dialogRef.close();
      },
      error: () => {}
    });
  }

  initForm() {
    this.generalForm = this.fb.group({
      description: [this.payload.description, [Validators.required, Validators.maxLength(200)]],
      active: [this.payload.active]
    });
  }

  loadPoses(): void {
    this.posService.findAll().subscribe({
      next: (response: PosPayload[]) => {
        if (response) {
          this.poses = response.filter(p => p.active);
          this.filteredPoses = this.posControl.valueChanges.pipe(
            startWith(''),
            map(value => (typeof value === 'string' ? value : value?.name || '')),
            map(name => name ? this._filterPoses(name) : this.poses.slice())
          );
        }
      },
      error: () => {}
    });
    this.posControl.valueChanges.subscribe(value => {
      if (value && typeof value === 'object') {
        this.selectedPos = value;
      } else {
        this.selectedPos = null;
      }
    });
  }

  displayPosName(pos?: PosPayload): string {
    return pos ? pos.code + ' | ' + pos.name : '';
  }

  private _filterPoses(value: string): PosPayload[] {
    const filterValue = value.toLowerCase();
    return this.poses.filter(p =>
      p.name.toLowerCase().includes(filterValue) ||
      p.code.toLowerCase().includes(filterValue)
    );
  }
}

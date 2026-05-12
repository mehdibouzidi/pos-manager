import { AsyncPipe, CommonModule, NgIf } from '@angular/common';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { Observable, map, startWith } from 'rxjs';
import { ApiKeyPayload } from 'src/app/backend/payloads/admin/api-key-payload';
import { PosPayload } from 'src/app/backend/payloads/admin/pospayload';
import { ApiKeyService } from 'src/app/backend/service/admin/api-key.service';
import { PosService } from 'src/app/backend/service/admin/pos.service';

@Component({
  selector: 'vex-edit-api-key',
  standalone: true,
  templateUrl: './edit-api-key.component.html',
  styleUrl: './edit-api-key.component.scss',
  imports: [
    ReactiveFormsModule, MatDialogModule, NgIf, AsyncPipe, MatButtonModule,
    MatIconModule, MatDividerModule, MatFormFieldModule, MatAutocompleteModule,
    MatOptionModule, MatInputModule, MatCommonModule, CommonModule,
    MatSlideToggleModule, MatTooltipModule
  ]
})
export class EditApiKeyComponent implements OnInit {
  generalForm: FormGroup;
  payload = new ApiKeyPayload();

  poses: PosPayload[] = [];
  posControl = new FormControl();
  filteredPoses: Observable<PosPayload[]>;
  selectedPos: PosPayload | null = null;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditApiKeyComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private service: ApiKeyService,
    private posService: PosService
  ) {
    this.payload = { ...this.data.element };
  }

  ngOnInit(): void {
    this.initForm();
    this.loadPoses();
  }

  get f() { return this.generalForm.controls; }

  close(): void { this.dialogRef.close(); }

  regenerate(): void {
    this.service.regenerate(this.payload.id).subscribe({
      next: (response: ApiKeyPayload) => {
        if (response) {
          this.payload = response;
          this.generalForm.patchValue({ description: response.description, active: response.active });
        }
      },
      error: () => {}
    });
  }

  update(): void {
    if (this.generalForm.invalid) return;
    this.payload.description = this.f['description'].value;
    this.payload.active = this.f['active'].value;
    if (this.selectedPos) {
      this.payload.posId = this.selectedPos.id;
    }
    this.service.update(this.payload).subscribe({
      next: (response: ApiKeyPayload) => {
        if (response != null) this.dialogRef.close(response);
      },
      error: () => {}
    });
  }

  onPosSelected(pos: PosPayload): void {
    this.selectedPos = pos;
  }

  displayPosName(pos?: PosPayload): string {
    return pos ? pos.code + ' | ' + pos.name : '';
  }

  private loadPoses(): void {
    this.filteredPoses = this.posControl.valueChanges.pipe(
      startWith(''),
      map(() => this.poses.slice())
    );
    this.posService.findAll().subscribe({
      next: (response: any) => {
        this.poses = (response as PosPayload[]).filter(p => p.active);
        // Pre-select current POS if already set
        if (this.payload.posId) {
          const current = this.poses.find(p => p.id === this.payload.posId);
          if (current) {
            this.posControl.setValue(current);
            this.selectedPos = current;
          }
        }
        this.filteredPoses = this.posControl.valueChanges.pipe(
          startWith(this.posControl.value),
          map(value => (typeof value === 'string' ? value : value?.name ?? '')),
          map(name => name ? this.filterPoses(name) : this.poses.slice())
        );
      },
      error: () => {}
    });
  }

  private filterPoses(value: string): PosPayload[] {
    const filter = value.toLowerCase();
    return this.poses.filter(p =>
      p.name?.toLowerCase().includes(filter) || p.code?.toLowerCase().includes(filter)
    );
  }

  initForm() {
    this.generalForm = this.fb.group({
      description: [this.payload.description, [Validators.required, Validators.maxLength(200)]],
      active: [this.payload.active]
    });
  }
}

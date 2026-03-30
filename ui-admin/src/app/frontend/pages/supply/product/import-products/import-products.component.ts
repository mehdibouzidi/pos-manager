import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { stagger40ms } from '@vex/animations/stagger.animation';
import { VexBreadcrumbsComponent } from '@vex/components/vex-breadcrumbs/vex-breadcrumbs.component';
import { VexSecondaryToolbarComponent } from '@vex/components/vex-secondary-toolbar/vex-secondary-toolbar.component';
import { ProductService } from 'src/app/backend/service/business/product.service';
import { UtilStatic } from 'src/app/backend/service/util/UtilStatic';
import { DndComponent } from 'src/app/frontend/common/dnd/dnd.component';

@Component({
  selector: 'vex-import-products',
  standalone: true,
  templateUrl: './import-products.component.html',
  styleUrl: './import-products.component.scss',
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
    DndComponent
  ]
})
export class ImportProductsComponent {
 @ViewChild('dragDrop') dragDrop: DndComponent;

  isLoading = false;
  constructor(
    private service: ProductService,
    private snackbar: MatSnackBar
  ) {}

  ngOnInit(): void {}

  import() {
    this.isLoading = true;
    if (this.dragDrop.files != null && this.dragDrop.files[0] != null) {
      if (this.dragDrop.files[0].type !== 'text/csv') {
        this.openSnackBar('Veuillez sélectionner un fichier CSV!', 'warning');
        return;
      } else {
        this.service.import(UtilStatic.getCSVFromDnd(this.dragDrop)).subscribe({
          next: (response: any) => {
            this.isLoading = false;

            if (response) {
              this.openSnackBar(
                'Import a été effectué avec succès!',
                'success'
              );
            } else {
              this.openSnackBar(
                'Import a été effectué avec des erreurs!',
                'warning'
              );
            }
          },
          error: () => {
            this.isLoading = false;
            this.openSnackBar('Import a échoué!', 'error');
          } // Handle error appropriately
        });
      }
    } else {
      this.openSnackBar('Veuillez sélectionner un fichier!', 'warning');
    }
  }

  openSnackBar(message: string, type: string) {
    this.snackbar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['snack-' + type]
    });
  }
}

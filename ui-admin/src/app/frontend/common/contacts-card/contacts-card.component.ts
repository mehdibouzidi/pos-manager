import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { CommonService } from '../../../backend/service/util/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DeleteConfirmationDialogComponent } from '../delete-confirmation-dialog/delete-confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'vex-contacts-card',
  standalone: true,
  imports: [MatRippleModule, MatIconModule, MatButtonModule, NgIf],
  templateUrl: './contacts-card.component.html',
  styleUrl: './contacts-card.component.scss'
})
export class ContactsCardComponent implements OnInit {
  @Input({ required: true }) contact!: any;
  @Input({ required: true }) service!: any;
  @Input({ required: true }) canCreate!: boolean;
  @Input({ required: true }) canUpdate!: any;
  @Input({ required: true }) canDelete!: any;

  @Output() refreshEvent = new EventEmitter<void>();

  picture: any;
  constructor(private commonService: CommonService,
  private router: Router,
  private route: ActivatedRoute, private dialog: MatDialog) {}

  ngOnInit() {
    this.picture = this.commonService.createImageFromBlob(
      this.contact.picture
    );
  }

  refreshParent() {
    this.refreshEvent.emit();
  }

  delete(){
    if (!this.canDelete) {
      return;
    }
    const id= this.contact.id;
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.service.delete(id).subscribe({
          next: (response: boolean) => {
            if (response) {
              this.refreshParent();
            }
          },
          error: () => {
            // Handle error appropriately
          }
        });
      }
    });
  }

  goToEdit() {
    const data = this.contact;
    this.router.navigate(['./insert'], {
      state: { data },
      relativeTo: this.route
    });
  }

  goToShow() {
    const data = this.contact;
    data.disableDisplay = true;
    this.router.navigate(['./insert'], {
      state: { data },
      relativeTo: this.route
    });
  }
}

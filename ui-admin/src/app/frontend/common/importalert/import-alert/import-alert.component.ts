import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
  selector: 'app-import-alert',
  templateUrl: './import-alert.component.html',
  styleUrls: ['./import-alert.component.css']
})
export class ImportAlertComponent implements OnInit {

  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) {}

  getMessage(): string {
    switch (this.data.type) {
      case 'success':
        return 'Import a été effectué avec succès!';
      case 'error':
        return 'Import a échoué!';
      case 'warning':
        return 'Import a été effectué avec des erreurs!';
      default:
        return 'Import a été effectué avec succès!';
    }
  }


  ngOnInit(): void {
  }

}

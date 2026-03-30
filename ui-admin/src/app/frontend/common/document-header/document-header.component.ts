import { Component } from '@angular/core';
import { BusinessValuesConstants } from '../../../backend/service/util/BusinessValuesConstants';

@Component({
  selector: 'vex-document-header',
  standalone: true,
  imports: [],
  templateUrl: './document-header.component.html',
  styleUrl: './document-header.component.scss'
})
export class DocumentHeaderComponent {

  protected readonly BusinessValuesConstants = BusinessValuesConstants;
}

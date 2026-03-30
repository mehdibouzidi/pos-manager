import { Component, Input, OnInit } from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';

@Component({
  selector: 'vex-multi-auto-complete',
  standalone: true,
  templateUrl: './multi-auto-complete.component.html',
  styleUrl: './multi-auto-complete.component.scss',
  imports: [MatFormFieldModule, MatSelectModule, FormsModule, ReactiveFormsModule]
})
export class MultiAutoCompleteComponent implements OnInit {
  @Input() title!: string;
  @Input() service: any;
  @Input() selectedInput: any = null;

  selectedItems = new FormControl('');
  allItems: any[];

  constructor() { }

  ngOnInit(): void {
    this.getAllItems();
  }

  private getAllItems() {
    this.service.findAll().subscribe({
      next: (response: Array<any>) => {
        if (response != null) {
          this.allItems = response;
          if (this.selectedInput) {
            // Find matching items in allItems based on selectedInput
            const selectedValues = this.selectedInput
              .map((input: any) => {
                // Find the corresponding item in allItems
                return this.allItems.find((item: any) => item.id === input.id);
              })
              .filter((item: any) => item != null); // Filter out undefined values
  
            // Set the selected values in the FormControl
            this.selectedItems.setValue(selectedValues);
          }
        }
      },
      error: () => { },
    });
  }
}

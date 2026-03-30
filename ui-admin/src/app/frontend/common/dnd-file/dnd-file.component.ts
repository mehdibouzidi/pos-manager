import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DndFileDirective } from './directives/dnd-file.directive';

@Component({
  selector: 'drag-and-drop-file',
  templateUrl: './dnd-file.component.html',
  styleUrls: ['./dnd-file.component.scss'],
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    CommonModule,
    DndFileDirective
  ]
})
export class DndFileComponent implements OnInit {

  @ViewChild("fileDropRef", { static: false }) fileDropEl: ElementRef;
  files: any[] = [];
  isDisabledOnFirstUpload = false;

  constructor() { }

  ngOnInit(): void {
  }

  /**
   * on file drop handler
   */
  onFileDropped($event) {
    this.prepareFilesList($event);
  }

  /**
   * handle file from browsing
   */
  fileBrowseHandler(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.prepareFilesList(Array.from(input.files));
    }
  }

  /**
   * Delete file from files list
   * @param index (File index)
  */
  deleteFile(index: number) {
    const file = this.files[index];
    if (!file) {
      return;
    }
    if (file.progress < 100) {
      return;
    }
    this.files.splice(index, 1);
    this.isDisabledOnFirstUpload = false;
  }

  /**
   * Simulate the upload process
  */
  uploadFilesSimulator(index: number) {
    setTimeout(() => {
      if (index >= this.files.length) {
        return;
      } else {
        const progressInterval = setInterval(() => {
          const file = this.files[index];
          if (!file) {
            clearInterval(progressInterval);
            return;
          }
          if (file.progress === 100) {
            clearInterval(progressInterval);
            this.uploadFilesSimulator(index + 1);
          } else {
            file.progress += 5;
          }
        }, 200);
      }
    }, 1000);
  }

  /**
   * Convert Files list to normal array list
   * @param files (Files List)
   */
  prepareFilesList(files: Array<any>) {
    for (const item of files) {
      if (item.type === 'application/pdf' || item.type.startsWith('image/')) {
        item.progress = 0;
        this.files.push(item);
      }
    }
    this.fileDropEl.nativeElement.value = "";
    if (this.files.length) {
      this.uploadFilesSimulator(0);
      this.isDisabledOnFirstUpload = true;
    }
  }

  /**
   * format bytes
   * @param bytes (File size in bytes)
   * @param decimals (Decimals point)
   */
  formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) {
      return "0 Bytes";
    }
    const k = 1024;
    const dm = decimals <= 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }
}

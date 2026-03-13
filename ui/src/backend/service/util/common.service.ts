import { Injectable } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  imageToShow: any;
  constructor(private sanitizer: DomSanitizer) {}

  createImageFromBlob(image: any): SafeUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      'data:image/jpeg;base64,' + image
    );
  }

  createImageFileFromBlob(image: any): File {
    //CONVERT TO B64Array
//    var blob = new Blob([image], { type: 'image/jpeg' });
    var blob = this.b64toBlob(image);
    //var myImage = this.base64ImageToBlob(image);
    var myFile = this.blobToFile(blob, 'image.png');
    return <File>myFile;
  }

  b64toBlob(image: any) {

    var byteString = atob(image);
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);

    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: 'image/jpeg' });
  }

  blobToFile = (theBlob: Blob, fileName: string): File => {
    var b: any = theBlob;
    //A Blob() is almost a File() - it's just missing the two properties below which we will add
    b.lastModifiedDate = new Date();
    b.name = fileName;

    //Cast to a File() type
    return <File>theBlob;
  };


}

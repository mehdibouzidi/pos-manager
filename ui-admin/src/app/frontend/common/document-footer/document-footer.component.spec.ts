import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentFooterComponent } from './document-footer.component';

describe('DocumentFooterComponent', () => {
  let component: DocumentFooterComponent;
  let fixture: ComponentFixture<DocumentFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentFooterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

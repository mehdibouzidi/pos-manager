import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisableConfirmationDialogComponent } from './disable-confirmation-dialog.component';

describe('DisableConfirmationDialogComponent', () => {
  let component: DisableConfirmationDialogComponent;
  let fixture: ComponentFixture<DisableConfirmationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisableConfirmationDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisableConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

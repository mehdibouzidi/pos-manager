import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllPrivilegesComponent } from './all-privileges.component';

describe('AllPrivilegesComponent', () => {
  let component: AllPrivilegesComponent;
  let fixture: ComponentFixture<AllPrivilegesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllPrivilegesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllPrivilegesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

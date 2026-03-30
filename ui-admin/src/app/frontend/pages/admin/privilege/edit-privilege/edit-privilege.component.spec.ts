import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPrivilegeComponent } from './edit-privilege.component';

describe('EditPrivilegeComponent', () => {
  let component: EditPrivilegeComponent;
  let fixture: ComponentFixture<EditPrivilegeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditPrivilegeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditPrivilegeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

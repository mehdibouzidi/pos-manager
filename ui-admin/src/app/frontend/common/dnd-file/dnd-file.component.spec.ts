import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DndFileComponent } from './dnd-file.component';
 
describe('DndFileComponent', () => {
  let component: DndFileComponent;
  let fixture: ComponentFixture<DndFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DndFileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DndFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

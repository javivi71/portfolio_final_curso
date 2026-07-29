import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditarProyectoPage } from './editar-proyecto.page';

describe('EditarProyectoPage', () => {
  let component: EditarProyectoPage;
  let fixture: ComponentFixture<EditarProyectoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarProyectoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

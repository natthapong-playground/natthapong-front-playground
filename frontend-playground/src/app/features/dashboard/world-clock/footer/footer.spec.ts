import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorldClockFooter } from './footer';

describe('WorldClockFooter', () => {
  let component: WorldClockFooter;
  let fixture: ComponentFixture<WorldClockFooter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorldClockFooter],
    }).compileComponents();

    fixture = TestBed.createComponent(WorldClockFooter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

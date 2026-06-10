import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorldClockPage } from './world-clock-page';

describe('WorldClockPage', () => {
  let component: WorldClockPage;
  let fixture: ComponentFixture<WorldClockPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorldClockPage],
    }).compileComponents();

    fixture = TestBed.createComponent(WorldClockPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

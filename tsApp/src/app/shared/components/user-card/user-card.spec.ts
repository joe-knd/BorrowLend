import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCard } from './user-card';

describe('UserCard', () => {
  let component: UserCard;
  let fixture: ComponentFixture<UserCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserCard],
    }).compileComponents();

    fixture = TestBed.createComponent(UserCard);
    component = fixture.componentInstance;
    component.user = {
      id: '1',
      email: 'user@example.com',
      firstName: 'Test',
      lastName: 'User',
      averageRating: 0,
      totalRatings: 0,
      createdAt: new Date().toISOString()
    };
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

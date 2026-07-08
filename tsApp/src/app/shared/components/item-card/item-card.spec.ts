import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { ItemCard } from './item-card';
import { StatusColor } from '../../pipes/status-color-pipe';

describe('ItemCard', () => {
  let component: ItemCard;
  let fixture: ComponentFixture<ItemCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ItemCard, StatusColor],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ItemCard);
    component = fixture.componentInstance;
    component.item = {
      id: 1,
      name: 'Test Item',
      description: 'Test Description',
      imageUrl: null,
      status: 'Available',
      ownerId: '1',
      owner: {
        id: '1',
        email: 'owner@example.com',
        firstName: 'Owner',
        lastName: 'User',
        averageRating: 0,
        totalRatings: 0,
        createdAt: new Date().toISOString()
      }
    } as any;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

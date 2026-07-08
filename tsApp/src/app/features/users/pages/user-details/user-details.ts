import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Users } from '../../../../core/services/users';
import { Borrowings } from '../../../../core/services/borrowings';
import { Ratings } from '../../../../core/services/ratings';
import { BorrowingRecord } from '../../../../shared/models/borrowing-record.model';
import { Item } from '../../../../shared/models/item.model';
import { User } from '../../../../shared/models/user.model';
import { Auth } from '../../../../core/services/auth';

@Component({
  selector: 'app-user-details',
  standalone: false,
  templateUrl: './user-details.html',
  styleUrl: './user-details.css',
})
export class UserDetails {
  private route = inject(ActivatedRoute);
  private users = inject(Users);
  private borrowings = inject(Borrowings);
  private ratingsService = inject(Ratings);
  private auth = inject(Auth);

  userId = this.route.snapshot.paramMap.get('id')!;
  readonly user = signal<User | null>(null);

  readonly borrowedRecords = signal<BorrowingRecord[]>([]);
  readonly lentRecords = signal<BorrowingRecord[]>([]);
  readonly ratings = signal<any[]>([]);
  readonly isLoadingUser = signal(false);
  readonly isLoadingBorrowed = signal(false);
  readonly isLoadingLent = signal(false);
  readonly isLoadingRatings = signal(false);
  readonly loadError = signal('');
  readonly actionError = signal('');
  readonly isActionLoading = signal(false);

  // Rating Modal state
  readonly ratingModalRecord = signal<BorrowingRecord | null>(null);
  readonly ratingModalAction = signal<'return' | 'lost'>('return');
  readonly ratingScore = signal<number>(5);
  readonly ratingComment = signal<string>('');
  readonly ratingNotes = signal<string>('');
  readonly isRatingSubmitting = signal<boolean>(false);
  readonly selectedDetailUserId = signal<string | null>(null);

  readonly isCurrentUserProfile = computed<boolean>(() => this.auth.currentUserId() === this.userId);

  readonly activeBorrowedRecords = computed(() => this.borrowedRecords().filter(r => ['Requested', 'Borrowed', 'ReturnRequested', 'ReturnPending'].includes(r.status)));
  readonly activeLentRecords = computed(() => this.lentRecords().filter(r => ['Requested', 'Borrowed', 'ReturnRequested', 'ReturnPending'].includes(r.status)));
  readonly borrowRequests = computed(() => this.lentRecords().filter(r => r.status === 'Requested'));

  ngOnInit() {
    this.loadError.set('');
    this.actionError.set('');
    this.loadUser();
    this.loadBorrowed();
    this.loadLent();
    this.loadRatings();
  }

  loadUser() {
    this.isLoadingUser.set(true);
    this.users.getById(this.userId).subscribe({
      next: (u) => {
        this.user.set(u);
        this.isLoadingUser.set(false);
      },
      error: (err) => {
        this.user.set(null);
        this.loadError.set(err?.error?.message ?? err?.message ?? 'Could not load user profile.');
        this.isLoadingUser.set(false);
      }
    });
  }

  loadBorrowed() {
    this.isLoadingBorrowed.set(true);
    this.borrowings.getBorrowedBy(this.userId).subscribe({
      next: (records: any) => {
        this.borrowedRecords.set(this.extractArray<BorrowingRecord>(records));
        this.isLoadingBorrowed.set(false);
      },
      error: () => {
        this.borrowedRecords.set([]);
        this.isLoadingBorrowed.set(false);
      }
    });
  }

  loadLent() {
    this.isLoadingLent.set(true);
    this.borrowings.getLentBy(this.userId).subscribe({
      next: (records: any) => {
        this.lentRecords.set(this.extractArray<BorrowingRecord>(records));
        this.isLoadingLent.set(false);
      },
      error: () => {
        this.lentRecords.set([]);
        this.isLoadingLent.set(false);
      }
    });
  }

  loadRatings() {
    this.isLoadingRatings.set(true);
    this.ratingsService.getRatingsForUser(this.userId).subscribe({
      next: (r: any) => {
        this.ratings.set(this.extractArray<any>(r));
        this.isLoadingRatings.set(false);
      },
      error: () => {
        this.ratings.set([]);
        this.isLoadingRatings.set(false);
      }
    });
  }

  approveRequest(record: BorrowingRecord) {
    if (this.isActionLoading()) return;
    this.actionError.set('');
    this.isActionLoading.set(true);

    this.borrowings.approveBorrow(record.id, this.userId).subscribe({
      next: () => {
        this.isActionLoading.set(false);
        this.loadBorrowed();
        this.loadLent();
      },
      error: (err) => {
        this.actionError.set(err?.error?.message ?? err?.message ?? 'Could not approve request.');
        this.isActionLoading.set(false);
      }
    });
  }

  rejectRequest(record: BorrowingRecord) {
    if (this.isActionLoading()) return;
    this.actionError.set('');
    this.isActionLoading.set(true);

    this.borrowings.rejectBorrow(record.id, this.userId).subscribe({
      next: () => {
        this.isActionLoading.set(false);
        this.loadLent();
      },
      error: (err) => {
        this.actionError.set(err?.error?.message ?? err?.message ?? 'Could not reject request.');
        this.isActionLoading.set(false);
      }
    });
  }

  requestReturn(record: BorrowingRecord) {
    if (this.isActionLoading()) return;
    this.actionError.set('');
    this.isActionLoading.set(true);

    this.borrowings.requestReturn(record.id, this.userId).subscribe({
      next: () => {
        this.isActionLoading.set(false);
        this.loadLent();
      },
      error: (err) => {
        this.actionError.set(err?.error?.message ?? err?.message ?? 'Could not request return.');
        this.isActionLoading.set(false);
      }
    });
  }

  initiateReturn(record: BorrowingRecord) {
    if (this.isActionLoading()) return;
    this.actionError.set('');
    this.isActionLoading.set(true);

    this.borrowings.initiateReturn(record.id, this.userId).subscribe({
      next: () => {
        this.isActionLoading.set(false);
        this.loadBorrowed();
      },
      error: (err) => {
        this.actionError.set(err?.error?.message ?? err?.message ?? 'Could not initiate return.');
        this.isActionLoading.set(false);
      }
    });
  }

  openRatingModal(record: BorrowingRecord, action: 'return' | 'lost') {
    this.ratingModalRecord.set(record);
    this.ratingModalAction.set(action);
    this.ratingScore.set(5);
    this.ratingComment.set('');
    this.ratingNotes.set('');
    this.actionError.set('');
  }

  closeRatingModal() {
    this.ratingModalRecord.set(null);
  }

  submitRatingAndAction() {
    const record = this.ratingModalRecord();
    const action = this.ratingModalAction();
    if (!record || this.isRatingSubmitting()) return;

    this.isRatingSubmitting.set(true);
    this.actionError.set('');

    const ratingData = {
      notes: this.ratingNotes() || undefined,
      rating: this.ratingScore(),
      comment: this.ratingComment() || undefined
    };

    const request$ = action === 'return'
      ? this.borrowings.confirmReturn(record.id, this.userId, ratingData)
      : this.borrowings.markLost(record.id, this.userId, ratingData);

    request$.subscribe({
      next: () => {
        this.isRatingSubmitting.set(false);
        this.closeRatingModal();
        this.loadBorrowed();
        this.loadLent();
        this.loadUser();
        this.loadRatings();
      },
      error: (err) => {
        this.actionError.set(err?.error?.message ?? err?.message ?? `Could not complete the ${action} action.`);
        this.isRatingSubmitting.set(false);
      }
    });
  }

  updateRatingScore(event: any) {
    this.ratingScore.set(Number(event.target.value));
  }

  updateRatingComment(event: any) {
    this.ratingComment.set(event.target.value);
  }

  updateRatingNotes(event: any) {
    this.ratingNotes.set(event.target.value);
  }

  getStarArray(rating: number): boolean[] {
    const rounded = Math.round(rating);
    return [1, 2, 3, 4, 5].map(i => i <= rounded);
  }

  private extractArray<T>(payload: any): T[] {
    const candidates = [
      payload,
      payload?.items,
      payload?.Items,
      payload?.data,
      payload?.$values,
      payload?.items?.$values,
      payload?.data?.$values
    ];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate as T[];
      }
    }

    return [];
  }
}

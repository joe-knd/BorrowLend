import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../../../core/services/auth';

@Component({
  selector: 'app-auth-landing',
  standalone: false,
  templateUrl: './auth-landing.html',
  styleUrl: './auth-landing.css',
})
export class AuthLanding {
  private router = inject(Router);
  private auth = inject(Auth);

  ngOnInit() {
    const currentUserId = this.auth.currentUserId();
    if (currentUserId) {
      this.router.navigate(['/borrowings/borrowed-by', currentUserId]);
    }
  }
}

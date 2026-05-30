import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);

  action: 'login' | 'signup' = 'login';
  loading = false;
  error: string | null = null;
  showPassword = false;

  get isLogin() { return this.action === 'login'; }
  get isSignUp() { return this.action === 'signup'; }

  switchTo(mode: 'login' | 'signup', e: Event) {
    e.preventDefault();
    this.error = null;
    this.action = mode;
  }

  async onSubmit(form: NgForm) {
    if (form.invalid) {
      this.error = 'Please fill in all required fields.';
      return;
    }
    this.loading = true;
    this.error = null;
    const { email, password } = form.value;
    try {
      let result;
      if (this.isSignUp) {
        result = await this.authService.signUp(email, password);
      } else {
        result = await this.authService.signIn(email, password);
      }
      this.router.navigate(['/profile', result.user.uid]);
    } catch (err) {
      const code = (err as any)?.code ?? '';
      this.error = this.friendlyError(code);
    } finally {
      this.loading = false;
    }
  }

  private friendlyError(code: string): string {
    switch (code) {
      case 'auth/email-already-in-use': return 'This email is already registered.';
      case 'auth/invalid-email':        return 'Invalid email address.';
      case 'auth/weak-password':        return 'Password must be at least 6 characters.';
      case 'auth/user-not-found':       return 'No account found with this email.';
      case 'auth/wrong-password':       return 'Incorrect password.';
      case 'auth/invalid-credential':   return 'Invalid email or password.';
      default:                          return 'Something went wrong. Please try again.';
    }
  }
}

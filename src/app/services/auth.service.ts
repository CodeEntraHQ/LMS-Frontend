import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';

export type UserRole = 'SUPERADMIN' | 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';

export interface AuthUser {
  id?: number;
  email: string;
  role: UserRole;
  name: string;
  collegeId?: number;
}

const STORAGE_KEY = 'lms_auth_user';
const API_URL = 'http://localhost:8080/api/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<{ ok: true; user: AuthUser } | { ok: false; message: string }> {
    const normalizedEmail = (email ?? '').trim().toLowerCase();
    const normalizedPassword = (password ?? '').trim();

    return this.http.post<{ ok: boolean; user?: any; message?: string }>(
      `${API_URL}/login`,
      {
        email: normalizedEmail,
        password: normalizedPassword
      }
    ).pipe(
      map(response => {
        if (response.ok && response.user) {
          const user: AuthUser = {
            id: response.user.id,
            email: response.user.email,
            role: response.user.role as UserRole,
            name: response.user.name,
            collegeId: response.user.collegeId
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
          return { ok: true as const, user };
        }
        return { ok: false as const, message: response.message || 'Invalid email or password' };
      }),
      catchError(error => {
        return of({ ok: false as const, message: error.error?.message || 'Login failed. Please try again.' });
      })
    );
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  getUser(): AuthUser | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }

  isLoggedIn(): boolean {
    return this.getUser() !== null;
  }
}


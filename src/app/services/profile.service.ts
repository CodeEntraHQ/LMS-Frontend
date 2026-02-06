import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';

export interface Profile {
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  gender: string;
  address: string;
  bio: string;
  profileImage: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  profileCompletion: number;
  isActive: boolean;
}

const API_URL = 'http://localhost:8080/api/user';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  constructor(private http: HttpClient) {}

  getProfile(email: string): Observable<{ ok: true; profile: Profile } | { ok: false; message: string }> {
    return this.http.get<{ ok: boolean; profile?: Profile; message?: string }>(
      `${API_URL}/profile`,
      { params: { email } }
    ).pipe(
      map(response => {
        if (response.ok && response.profile) {
          return { ok: true as const, profile: response.profile };
        }
        return { ok: false as const, message: response.message || 'Failed to load profile' };
      }),
      catchError(error => {
        return of({ ok: false as const, message: error.error?.message || 'Failed to load profile' });
      })
    );
  }

  updateProfile(email: string, profileData: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    gender?: string;
    address?: string;
    bio?: string;
    profileImage?: string;
  }): Observable<{ ok: true; profile: Profile } | { ok: false; message: string }> {
    return this.http.put<{ ok: boolean; profile?: Profile; message?: string }>(
      `${API_URL}/profile`,
      { email, ...profileData }
    ).pipe(
      map(response => {
        if (response.ok && response.profile) {
          return { ok: true as const, profile: response.profile };
        }
        return { ok: false as const, message: response.message || 'Failed to update profile' };
      }),
      catchError(error => {
        return of({ ok: false as const, message: error.error?.message || 'Failed to update profile' });
      })
    );
  }

  changePassword(email: string, currentPassword: string, newPassword: string): Observable<{ ok: true } | { ok: false; message: string }> {
    return this.http.put<{ ok: boolean; message?: string }>(
      `${API_URL}/profile/password`,
      { email, currentPassword, newPassword }
    ).pipe(
      map(response => {
        if (response.ok) {
          return { ok: true as const };
        }
        return { ok: false as const, message: response.message || 'Failed to change password' };
      }),
      catchError(error => {
        return of({ ok: false as const, message: error.error?.message || 'Failed to change password' });
      })
    );
  }
}

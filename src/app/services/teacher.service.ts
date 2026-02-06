import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Teacher {
  id?: number;
  userId?: number;
  collegeId?: number;
  employeeId?: string;
  qualification?: string;
  specialization?: string;
  subjects?: string;
  status?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  gender?: string;
  address?: string;
  bio?: string;
  profileImage?: string;
  isActive?: boolean;
  createdAt?: string;
}

interface ApiResponse<T> {
  ok: boolean;
  message?: string;
  teachers?: T[];
  teacher?: T;
}

@Injectable({
  providedIn: 'root'
})
export class TeacherService {
  private apiUrl = 'http://localhost:8080/api/teachers';

  constructor(private http: HttpClient) {}

  getTeachersByEntity(entityId: number): Observable<{ ok: boolean; teachers?: Teacher[]; message?: string }> {
    return this.http.get<ApiResponse<Teacher>>(`${this.apiUrl}/entity/${entityId}`).pipe(
      map(response => ({
        ok: response.ok,
        teachers: response.teachers || [],
        message: response.message
      }))
    );
  }

  getTeacherById(id: number): Observable<{ ok: boolean; teacher?: Teacher; message?: string }> {
    return this.http.get<ApiResponse<Teacher>>(`${this.apiUrl}/${id}`).pipe(
      map(response => ({
        ok: response.ok,
        teacher: response.teacher,
        message: response.message
      }))
    );
  }

  getTeachersByStatus(entityId: number, status: string): Observable<{ ok: boolean; teachers?: Teacher[]; message?: string }> {
    return this.http.get<ApiResponse<Teacher>>(`${this.apiUrl}/entity/${entityId}/status/${status}`).pipe(
      map(response => ({
        ok: response.ok,
        teachers: response.teachers || [],
        message: response.message
      }))
    );
  }

  updateTeacher(id: number, teacherData: Partial<Teacher>): Observable<{ ok: boolean; message?: string }> {
    return this.http.put<{ ok: boolean; message?: string }>(`${this.apiUrl}/${id}`, teacherData);
  }

  updateTeacherStatus(id: number, status: string): Observable<{ ok: boolean; message?: string }> {
    return this.http.put<{ ok: boolean; message?: string }>(`${this.apiUrl}/${id}/status`, { status });
  }

  resetTeacherPassword(id: number): Observable<{ ok: boolean; message?: string }> {
    return this.http.post<{ ok: boolean; message?: string }>(`${this.apiUrl}/${id}/reset-password`, {});
  }

  deleteTeacher(id: number): Observable<{ ok: boolean; message?: string }> {
    return this.http.delete<{ ok: boolean; message?: string }>(`${this.apiUrl}/${id}`);
  }

  activateTeacher(id: number): Observable<{ ok: boolean; message?: string }> {
    return this.http.put<{ ok: boolean; message?: string }>(`${this.apiUrl}/${id}/activate`, {});
  }

  deactivateTeacher(id: number): Observable<{ ok: boolean; message?: string }> {
    return this.http.put<{ ok: boolean; message?: string }>(`${this.apiUrl}/${id}/deactivate`, {});
  }

  getNextEmployeeId(entityId: number): Observable<{ ok: boolean; employeeId?: string; message?: string }> {
    return this.http.get<{ ok: boolean; employeeId?: string; message?: string }>(`${this.apiUrl}/next-employee-id/${entityId}`);
  }
}

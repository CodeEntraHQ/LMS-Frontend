import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Student {
  id?: number;
  userId?: number;
  entityId?: number;
  rollNumber?: string;
  classCourse?: string;
  courseId?: number;
  classId?: number;
  sectionId?: number;
  classSection?: string;
  academicYear?: string;
  studentStatus?: 'active' | 'inactive' | 'pass-out';
  admissionDate?: string;
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

export interface StudentResponse {
  ok: boolean;
  students?: Student[];
  student?: Student;
  message?: string;
  tempPassword?: string;
  rollNumber?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = 'http://localhost:8080/api/students';

  constructor(private http: HttpClient) {}

  getStudentsByEntity(entityId: number): Observable<StudentResponse> {
    return this.http.get<StudentResponse>(`${this.apiUrl}/entity/${entityId}`);
  }

  getStudentById(id: number): Observable<StudentResponse> {
    return this.http.get<StudentResponse>(`${this.apiUrl}/${id}`);
  }

  updateStudent(id: number, student: Partial<Student>): Observable<StudentResponse> {
    return this.http.put<StudentResponse>(`${this.apiUrl}/${id}`, student);
  }

  updateStudentStatus(id: number, status: 'active' | 'inactive' | 'pass-out'): Observable<StudentResponse> {
    return this.http.put<StudentResponse>(`${this.apiUrl}/${id}/status`, { status });
  }

  resetStudentPassword(id: number): Observable<StudentResponse> {
    return this.http.post<StudentResponse>(`${this.apiUrl}/${id}/reset-password`, {});
  }

  getStudentsByStatus(entityId: number, status: string): Observable<StudentResponse> {
    return this.http.get<StudentResponse>(`${this.apiUrl}/entity/${entityId}/status/${status}`);
  }

  deleteStudent(id: number): Observable<StudentResponse> {
    return this.http.delete<StudentResponse>(`${this.apiUrl}/${id}`);
  }

  activateStudent(id: number): Observable<StudentResponse> {
    return this.http.put<StudentResponse>(`${this.apiUrl}/${id}/activate`, {});
  }

  deactivateStudent(id: number): Observable<StudentResponse> {
    return this.http.put<StudentResponse>(`${this.apiUrl}/${id}/deactivate`, {});
  }

  getNextRollNumber(entityId: number, classSection: string): Observable<{ ok: boolean; rollNumber?: string; message?: string }> {
    return this.http.get<{ ok: boolean; rollNumber?: string; message?: string }>(`${this.apiUrl}/next-roll-number/${entityId}/${classSection}`);
  }

  generateRollNumber(entityId: number, sectionId: number, courseName: string, year: number): Observable<{ ok: boolean; rollNumber?: string; message?: string }> {
    return this.http.get<{ ok: boolean; rollNumber?: string; message?: string }>(`${this.apiUrl}/generate-roll-number/${entityId}/${sectionId}/${courseName}/${year}`);
  }

  getStudentByUserId(userId: number): Observable<StudentResponse> {
    return this.http.get<StudentResponse>(`${this.apiUrl}/user/${userId}`);
  }

  getStudentsBySection(sectionId: number): Observable<{ ok: boolean; students?: Student[]; count?: number; message?: string }> {
    return this.http.get<{ ok: boolean; students?: Student[]; count?: number; message?: string }>(`${this.apiUrl}/section/${sectionId}`);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface StudentPerformance {
  id?: number;
  studentId: number;
  subjectId: number;
  classId?: number;
  sectionId?: number;
  academicYear?: string;
  totalMarks?: number;
  obtainedMarks?: number;
  percentage?: number;
  grade?: string;
  totalSessions?: number;
  attendedSessions?: number;
  attendancePercentage?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentPerformanceSnapshot {
  studentId: number;
  academicYear?: string;
  overallPercentage?: number;
  averageAttendance?: number;
  totalSubjects?: number;
  performances?: StudentPerformance[];
}

interface ApiResponse<T> {
  ok: boolean;
  message?: string;
  data?: T;
  meta?: any;
}

@Injectable({
  providedIn: 'root'
})
export class StudentPerformanceService {
  private apiUrl = 'http://localhost:8080/api/student-performance';

  constructor(private http: HttpClient) {}

  /**
   * Get all performances with optional filters
   */
  getAllPerformances(
    filters?: {
      studentId?: number;
      subjectId?: number;
      sectionId?: number;
      academicYear?: string;
    }
  ): Observable<{ ok: boolean; data?: StudentPerformance[]; message?: string }> {
    let url = this.apiUrl;
    let params = '';

    if (filters) {
      const queryParams: string[] = [];
      if (filters.studentId) queryParams.push(`studentId=${filters.studentId}`);
      if (filters.subjectId) queryParams.push(`subjectId=${filters.subjectId}`);
      if (filters.sectionId) queryParams.push(`sectionId=${filters.sectionId}`);
      if (filters.academicYear) queryParams.push(`academicYear=${filters.academicYear}`);
      if (queryParams.length > 0) params = '?' + queryParams.join('&');
    }

    return this.http.get<ApiResponse<StudentPerformance[]>>(url + params).pipe(
      map(response => ({
        ok: response.ok,
        data: response.data || [],
        message: response.message
      }))
    );
  }

  /**
   * Get performance by ID
   */
  getPerformanceById(id: number): Observable<{ ok: boolean; data?: StudentPerformance; message?: string }> {
    return this.http.get<ApiResponse<StudentPerformance>>(`${this.apiUrl}/${id}`).pipe(
      map(response => ({
        ok: response.ok,
        data: response.data,
        message: response.message
      }))
    );
  }

  /**
   * Get student performances in a section
   */
  getStudentPerformancesInSection(
    sectionId: number,
    studentIds?: number[],
    academicYear?: string
  ): Observable<{ ok: boolean; data?: StudentPerformance[]; message?: string }> {
    let url = `${this.apiUrl}/section/${sectionId}/students`;
    let params = '';

    const queryParams: string[] = [];
    if (studentIds && studentIds.length > 0) {
      queryParams.push(`studentIds=${studentIds.join(',')}`);
    }
    if (academicYear) {
      queryParams.push(`academicYear=${academicYear}`);
    } else {
      queryParams.push('academicYear=2025-26');
    }

    if (queryParams.length > 0) params = '?' + queryParams.join('&');

    return this.http.get<ApiResponse<StudentPerformance[]>>(url + params).pipe(
      map(response => ({
        ok: response.ok,
        data: response.data || [],
        message: response.message
      }))
    );
  }

  /**
   * Get performance snapshot for a student (overall performance)
   */
  getStudentPerformanceSnapshot(
    studentId: number,
    academicYear?: string
  ): Observable<{ ok: boolean; data?: StudentPerformanceSnapshot; message?: string }> {
    let url = `${this.apiUrl}/student/${studentId}/snapshot`;
    let params = '';

    if (academicYear) {
      params = `?academicYear=${academicYear}`;
    } else {
      params = '?academicYear=2025-26';
    }

    return this.http.get<ApiResponse<StudentPerformanceSnapshot>>(url + params).pipe(
      map(response => ({
        ok: response.ok,
        data: response.data,
        message: response.message
      }))
    );
  }

  /**
   * Create student performance
   */
  createPerformance(performance: StudentPerformance): Observable<{ ok: boolean; data?: StudentPerformance; message?: string }> {
    return this.http.post<ApiResponse<StudentPerformance>>(this.apiUrl, performance).pipe(
      map(response => ({
        ok: response.ok,
        data: response.data,
        message: response.message
      }))
    );
  }

  /**
   * Update student performance
   */
  updatePerformance(id: number, performance: Partial<StudentPerformance>): Observable<{ ok: boolean; data?: StudentPerformance; message?: string }> {
    return this.http.put<ApiResponse<StudentPerformance>>(`${this.apiUrl}/${id}`, performance).pipe(
      map(response => ({
        ok: response.ok,
        data: response.data,
        message: response.message
      }))
    );
  }

  /**
   * Delete student performance
   */
  deletePerformance(id: number): Observable<{ ok: boolean; message?: string }> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`).pipe(
      map(response => ({
        ok: response.ok,
        message: response.message
      }))
    );
  }

  /**
   * Get average performance for a subject in a section
   */
  getAveragePerformance(
    sectionId: number,
    subjectId: number,
    academicYear?: string
  ): Observable<{ ok: boolean; data?: any; message?: string }> {
    let url = `${this.apiUrl}/section/${sectionId}/subject/${subjectId}/average`;
    let params = '';

    if (academicYear) {
      params = `?academicYear=${academicYear}`;
    } else {
      params = '?academicYear=2025-26';
    }

    return this.http.get<ApiResponse<any>>(url + params).pipe(
      map(response => ({
        ok: response.ok,
        data: response.data,
        message: response.message
      }))
    );
  }
}

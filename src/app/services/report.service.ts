import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = 'http://localhost:8080/api/reports';

  constructor(private http: HttpClient) {}

  getStudentPerformance(params: Record<string, any>): Observable<any> {
    return this.http.get(`${this.apiUrl}/academic/student-performance`, { params: this.toParams(params) });
  }

  getExamAnalysis(params: Record<string, any>): Observable<any> {
    return this.http.get(`${this.apiUrl}/academic/exam-analysis`, { params: this.toParams(params) });
  }

  getAssignmentReport(params: Record<string, any>): Observable<any> {
    return this.http.get(`${this.apiUrl}/academic/assignment`, { params: this.toParams(params) });
  }

  getStudentAttendance(params: Record<string, any>): Observable<any> {
    return this.http.get(`${this.apiUrl}/attendance/student`, { params: this.toParams(params) });
  }

  getTeacherAttendance(params: Record<string, any>): Observable<any> {
    return this.http.get(`${this.apiUrl}/attendance/teacher`, { params: this.toParams(params) });
  }

  getFeeSummary(params: Record<string, any>): Observable<any> {
    return this.http.get(`${this.apiUrl}/financial/summary`, { params: this.toParams(params) });
  }

  getOverdueList(entityId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/financial/overdue`, { params: this.toParams({ entityId }) });
  }

  getTeacherActivity(entityId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/teacher-activity`, { params: this.toParams({ entityId }) });
  }

  getStudentActivity(params: Record<string, any>): Observable<any> {
    return this.http.get(`${this.apiUrl}/student-activity`, { params: this.toParams(params) });
  }

  getCustomReport(params: Record<string, any>): Observable<any> {
    return this.http.get(`${this.apiUrl}/custom`, { params: this.toParams(params) });
  }

  private toParams(params: Record<string, any>): HttpParams {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });
    return httpParams;
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TeacherAttendanceService {
  private apiUrl = 'http://localhost:8080/api/attendance/teacher';

  constructor(private http: HttpClient) {}

  getAssignedSubjects(teacherId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/subjects`, { params: this.toParams({ teacherId }) });
  }

  getStudents(classId: number, sectionId?: number): Observable<any> {
    const params: any = { classId };
    if (sectionId) params.sectionId = sectionId;
    return this.http.get(`${this.apiUrl}/students`, { params: this.toParams(params) });
  }

  getOrCreateSession(teacherId: number, subjectId: number, classId: number, sectionId: number | null, attendanceDate: string, entityId: number): Observable<any> {
    const params: any = { teacherId, subjectId, classId, attendanceDate, entityId };
    if (sectionId) params.sectionId = sectionId;
    return this.http.post(`${this.apiUrl}/session`, null, { params: this.toParams(params) });
  }

  markAttendance(teacherId: number, sessionId: number, attendanceData: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/mark?teacherId=${teacherId}&sessionId=${sessionId}`, attendanceData);
  }

  getHistory(teacherId: number, subjectId?: number, classId?: number, sectionId?: number, fromDate?: string, toDate?: string): Observable<any> {
    const params: any = { teacherId };
    if (subjectId) params.subjectId = subjectId;
    if (classId) params.classId = classId;
    if (sectionId) params.sectionId = sectionId;
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    return this.http.get(`${this.apiUrl}/history`, { params: this.toParams(params) });
  }

  getStudentWiseAttendance(teacherId: number, subjectId: number, classId: number, sectionId?: number): Observable<any> {
    const params: any = { teacherId, subjectId, classId };
    if (sectionId) params.sectionId = sectionId;
    return this.http.get(`${this.apiUrl}/student-wise`, { params: this.toParams(params) });
  }

  requestCorrection(teacherId: number, entryId: number, requestedStatus: string, reason: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/correction?teacherId=${teacherId}&entryId=${entryId}&requestedStatus=${requestedStatus}&reason=${encodeURIComponent(reason)}`, null);
  }

  getSessionDetails(teacherId: number, sessionId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/session/${sessionId}`, { params: this.toParams({ teacherId }) });
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

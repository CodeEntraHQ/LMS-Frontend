import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AttendanceOverview {
  attendancePercentage: number;
  totalEntries: number;
  presentEntries: number;
  pendingEntries: number;
  lateCount: number;
  missedCount: number;
  todaySessions: number;
  classSummary: Array<{ classId: number; totalEntries: number; presentEntries: number; percent: number }>;
  sectionSummary?: Array<{ sectionId: number; totalEntries: number; presentEntries: number; percent: number }>;
  subjectSummary?: Array<{ subjectId: number; totalEntries: number; presentEntries: number; percent: number }>;
  lowAttendanceAlerts: Array<{ studentId: number; percent: number; total: number }>;
}

export interface AttendanceStudentReport {
  studentId: number;
  total: number;
  present: number;
  percent: number;
}

export interface AttendanceTeacherActivity {
  teacherId: number;
  sessions: number;
  markedEntries: number;
  pendingEntries: number;
}

export interface AttendancePolicy {
  id?: number;
  entityId: number;
  minAttendancePercent?: number;
  warningThresholdPercent?: number;
  detentionThresholdPercent?: number;
  examEligibilityPercent?: number;
  assignmentEligibilityPercent?: number;
  lockAfterDays?: number;
}

export interface AttendanceCorrection {
  id?: number;
  entryId: number;
  requestedByUserId?: number;
  requestedRole?: string;
  requestedStatus?: string;
  reason?: string;
  status?: string;
  reviewedByUserId?: number;
  reviewedAt?: string;
  createdAt?: string;
}

export interface AttendanceAuditLog {
  id?: number;
  entityId?: number;
  sessionId?: number;
  entryId?: number;
  action?: string;
  oldValue?: string;
  newValue?: string;
  changedByUserId?: number;
  changedByRole?: string;
  changedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private apiUrl = 'http://localhost:8080/api/attendance/admin';

  constructor(private http: HttpClient) {}

  getOverview(params: Record<string, any>): Observable<any> {
    return this.http.get(`${this.apiUrl}/overview`, { params: this.toParams(params) });
  }

  getStudentReports(params: Record<string, any>): Observable<any> {
    return this.http.get(`${this.apiUrl}/student-reports`, { params: this.toParams(params) });
  }

  getTeacherActivity(params: Record<string, any>): Observable<any> {
    return this.http.get(`${this.apiUrl}/teacher-activity`, { params: this.toParams(params) });
  }

  getPolicy(entityId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/policy`, { params: this.toParams({ entityId }) });
  }

  updatePolicy(entityId: number, payload: AttendancePolicy): Observable<any> {
    return this.http.put(`${this.apiUrl}/policy`, payload, { params: this.toParams({ entityId }) });
  }

  getCorrections(status?: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/corrections`, { params: this.toParams({ status }) });
  }

  updateCorrection(id: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/corrections/${id}`, { status });
  }

  lockSession(sessionId: number, lock: boolean): Observable<any> {
    return this.http.put(`${this.apiUrl}/lock`, null, { params: this.toParams({ sessionId, lock }) });
  }

  getAuditLogs(entityId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/audit`, { params: this.toParams({ entityId }) });
  }

  // Teacher Attendance Methods
  getTeacherDailyAttendance(entityId: number, attendanceDate?: string): Observable<any> {
    const params: any = { entityId };
    if (attendanceDate) params.attendanceDate = attendanceDate;
    return this.http.get(`${this.apiUrl}/teacher/daily`, { params: this.toParams(params) });
  }

  markTeacherAttendance(entityId: number, sessionId: number, markedByUserId: number, attendanceData: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/teacher/mark?entityId=${entityId}&sessionId=${sessionId}&markedByUserId=${markedByUserId}`, attendanceData);
  }

  getTeacherAttendanceDashboard(entityId: number, fromDate?: string, toDate?: string): Observable<any> {
    const params: any = { entityId };
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    return this.http.get(`${this.apiUrl}/teacher/dashboard`, { params: this.toParams(params) });
  }

  getTeacherAttendanceReports(entityId: number, fromDate: string, toDate: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/teacher/reports`, { params: this.toParams({ entityId, fromDate, toDate }) });
  }

  lockTeacherAttendanceSession(sessionId: number, lock: boolean): Observable<any> {
    return this.http.put(`${this.apiUrl}/teacher/lock`, null, { params: this.toParams({ sessionId, lock }) });
  }

  getTeacherAttendanceAuditLogs(entityId: number, sessionId?: number): Observable<any> {
    const params: any = { entityId };
    if (sessionId) params.sessionId = sessionId;
    return this.http.get(`${this.apiUrl}/teacher/audit`, { params: this.toParams(params) });
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

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Notice {
  id?: number;
  entityId: number;
  courseId?: number;
  classId?: number;
  sectionId?: number;
  title: string;
  description?: string;
  noticeType?: string;
  targetAudience?: string;
  status?: string;
  publishAt?: string;
  expiresAt?: string;
  visibleToStudents?: boolean;
  visibleToTeachers?: boolean;
  visibleToParents?: boolean;
  sendEmail?: boolean;
  sendSms?: boolean;
  sendWhatsapp?: boolean;
  attachmentData?: string;
  attachmentName?: string;
  attachmentType?: string;
  createdByUserId?: number;
  createdByRole?: string;
  updatedByUserId?: number;
  updatedByRole?: string;
}

export interface NoticeOverview {
  total: number;
  draft: number;
  published: number;
  archived: number;
  scheduled: number;
  expired: number;
}

@Injectable({
  providedIn: 'root'
})
export class NoticeService {
  private apiUrl = 'http://localhost:8080/api/notices';

  constructor(private http: HttpClient) {}

  getAdminOverview(params: Record<string, any>): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/overview`, { params: this.toParams(params) });
  }

  getAdminList(params: Record<string, any>): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/list`, { params: this.toParams(params) });
  }

  // Teacher / other roles
  getTeacherNotices(entityId: number, userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/teacher/list`, { params: this.toParams({ entityId, userId }) });
  }

  // Student: received notices list (read-only)
  getStudentNotices(entityId: number, userId: number, courseId?: number, classId?: number, sectionId?: number): Observable<any> {
    const params: Record<string, any> = { entityId, userId };
    if (courseId) params['courseId'] = courseId;
    if (classId) params['classId'] = classId;
    if (sectionId) params['sectionId'] = sectionId;
    return this.http.get(`${this.apiUrl}/student/list`, { params: this.toParams(params) });
  }

  markRead(noticeId: number, userId: number, role: string = 'TEACHER'): Observable<any> {
    return this.http.post(`${this.apiUrl}/read`, { noticeId, userId, role });
  }

  createNotice(notice: Notice, userId?: number, role: string = 'ADMIN'): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin`, notice, { params: this.toParams({ userId, role }) });
  }

  createTeacherNotice(notice: Notice, userId: number): Observable<any> {
    return this.createNotice(notice, userId, 'TEACHER');
  }

  updateNotice(id: number, notice: Notice, userId?: number, role: string = 'ADMIN'): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/${id}`, notice, { params: this.toParams({ userId, role }) });
  }

  updateStatus(id: number, status: string, userId?: number, role: string = 'ADMIN'): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/${id}/status`, { status }, { params: this.toParams({ userId, role }) });
  }

  deleteNotice(id: number, userId?: number, role: string = 'ADMIN'): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/${id}`, { params: this.toParams({ userId, role }) });
  }

  getAuditLogs(entityId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/audit`, { params: this.toParams({ entityId }) });
  }

  deleteAuditLog(logId: number, userId?: number, role: string = 'ADMIN'): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/audit/${logId}`, { params: this.toParams({ userId, role }) });
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

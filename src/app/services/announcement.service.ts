import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Announcement {
  id?: number;
  entityId?: number;
  teacherId?: number;
  subjectId?: number;
  classId?: number;
  sectionId?: number;
  title: string;
  description?: string;
  announcementType?: string;
  attachmentData?: string;
  attachmentName?: string;
  attachmentType?: string;
  status?: string;
  publishAt?: string;
  scheduleAt?: string;
  createdByUserId?: number;
  createdByRole?: string;
  updatedByUserId?: number;
  updatedByRole?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AnnouncementService {
  private apiUrl = 'http://localhost:8080/api/announcements';

  constructor(private http: HttpClient) {}

  createAnnouncement(teacherId: number, announcement: Announcement, userId?: number): Observable<any> {
    const params: Record<string, any> = { teacherId };
    if (userId) params['userId'] = userId;
    return this.http.post(`${this.apiUrl}/teacher/create`, announcement, { params: this.toParams(params) });
  }

  getAnnouncementsForTeacher(
    teacherId: number,
    subjectId?: number,
    classId?: number,
    sectionId?: number,
    status?: string
  ): Observable<any> {
    const params: Record<string, any> = { teacherId };
    if (subjectId) params['subjectId'] = subjectId;
    if (classId) params['classId'] = classId;
    if (sectionId) params['sectionId'] = sectionId;
    if (status) params['status'] = status;
    return this.http.get(`${this.apiUrl}/teacher/list`, { params: this.toParams(params) });
  }

  updateAnnouncement(id: number, teacherId: number, announcement: Announcement, userId?: number): Observable<any> {
    const params: Record<string, any> = { teacherId };
    if (userId) params['userId'] = userId;
    return this.http.put(`${this.apiUrl}/teacher/${id}`, announcement, { params: this.toParams(params) });
  }

  deleteAnnouncement(id: number, teacherId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/teacher/${id}`, { params: this.toParams({ teacherId }) });
  }

  // Admin methods
  getAllAnnouncementsForAdmin(entityId: number, includeHidden?: boolean): Observable<any> {
    const params: Record<string, any> = { entityId };
    if (includeHidden !== undefined) params['includeHidden'] = includeHidden;
    return this.http.get(`${this.apiUrl}/admin/list`, { params: this.toParams(params) });
  }

  updateAdminRemark(id: number, adminUserId: number, adminRemark: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/${id}/remark`, { adminRemark }, { params: this.toParams({ adminUserId }) });
  }

  toggleHide(id: number, adminUserId: number, isHidden?: boolean): Observable<any> {
    const params: Record<string, any> = { adminUserId };
    if (isHidden !== undefined) params['isHidden'] = isHidden;
    return this.http.put(`${this.apiUrl}/admin/${id}/hide`, {}, { params: this.toParams(params) });
  }

  // Student methods
  getAnnouncementsForStudent(
    entityId: number,
    userId: number,
    courseId?: number,
    classId?: number,
    sectionId?: number,
    subjectId?: number
  ): Observable<any> {
    const params: Record<string, any> = { entityId, userId };
    if (courseId) params['courseId'] = courseId;
    if (classId) params['classId'] = classId;
    if (sectionId) params['sectionId'] = sectionId;
    if (subjectId) params['subjectId'] = subjectId;
    return this.http.get(`${this.apiUrl}/student/list`, { params: this.toParams(params) });
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

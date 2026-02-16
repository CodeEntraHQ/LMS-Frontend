import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type SubjectContentType = 'SYLLABUS' | 'VIDEO' | 'NOTE' | 'PPT' | 'REFERENCE';

export interface SubjectContent {
  id?: number;
  entityId: number;
  subjectId: number;
  classId?: number;
  sectionId?: number;
  type: SubjectContentType;
  title: string;
  description?: string;
  unit?: string;
  topicName?: string;
  fileName?: string;
  fileUrl?: string;
  fileData?: string;
  linkUrl?: string;
  visibleToStudents?: boolean;
  visibleToParents?: boolean;
  teacherEditable?: boolean;
  status?: 'active' | 'inactive';
  createdByRole?: string;
  createdByUserId?: number;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SubjectContentService {
  private apiUrl = 'http://localhost:8080/api/subject-contents';

  constructor(private http: HttpClient) {}

  createContent(content: SubjectContent): Observable<any> {
    return this.http.post(this.apiUrl, content);
  }

  updateContent(id: number, content: Partial<SubjectContent>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, content);
  }

  deleteContent(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getBySubject(subjectId: number, role: string = 'ADMIN'): Observable<any> {
    return this.http.get(`${this.apiUrl}/subject/${subjectId}?role=${role}`);
  }

  getByClass(classId: number, role: string = 'ADMIN'): Observable<any> {
    return this.http.get(`${this.apiUrl}/class/${classId}?role=${role}`);
  }

  /**
   * Get study materials for a student
   * Only returns materials visible to students
   */
  getStudentMaterials(classId: number, sectionId?: number, subjectId?: number): Observable<any> {
    let url = `${this.apiUrl}/student-materials?classId=${classId}`;
    if (sectionId) {
      url += `&sectionId=${sectionId}`;
    }
    if (subjectId) {
      url += `&subjectId=${subjectId}`;
    }
    return this.http.get(url);
  }
}

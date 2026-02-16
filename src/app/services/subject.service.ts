import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Course {
  id?: number;
  entityId: number;
  name: string;
  type: 'SCHOOL' | 'COLLEGE';
  durationYears?: number;
  durationSemesters?: number;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface ClassEntity {
  id?: number;
  courseId: number;
  name: string;
  type: 'CLASS' | 'SEMESTER';
  academicYear?: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface Section {
  id?: number;
  classId: number;
  name: string;
  capacity?: number;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface Subject {
  id?: number;
  entityId: number;
  courseId: number;
  classId: number;
  name: string;
  subjectCode: string;
  subjectType: 'THEORY' | 'PRACTICAL' | 'LAB';
  maxMarks?: number;
  credits?: number;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface SubjectTeacherMapping {
  id?: number;
  subjectId: number;
  teacherId: number;
  sectionId?: number;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SubjectService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // Course methods
  getCoursesByEntity(entityId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/courses/entity/${entityId}`);
  }

  getCourseById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/courses/${id}`);
  }

  createCourse(course: Course): Observable<any> {
    return this.http.post(`${this.apiUrl}/courses`, course);
  }

  updateCourse(id: number, course: Course): Observable<any> {
    return this.http.put(`${this.apiUrl}/courses/${id}`, course);
  }

  deleteCourse(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/courses/${id}`);
  }

  // Class methods
  getClassesByCourse(courseId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/classes/course/${courseId}`);
  }

  getClassById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/classes/${id}`);
  }

  createClass(classEntity: ClassEntity): Observable<any> {
    return this.http.post(`${this.apiUrl}/classes`, classEntity);
  }

  updateClass(id: number, classEntity: ClassEntity): Observable<any> {
    return this.http.put(`${this.apiUrl}/classes/${id}`, classEntity);
  }

  deleteClass(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/classes/${id}`);
  }

  // Section methods
  getSectionsByClass(classId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/sections/class/${classId}`);
  }

  getSectionById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/sections/${id}`);
  }

  createSection(section: Section): Observable<any> {
    return this.http.post(`${this.apiUrl}/sections`, section);
  }

  updateSection(id: number, section: Section): Observable<any> {
    return this.http.put(`${this.apiUrl}/sections/${id}`, section);
  }

  deleteSection(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/sections/${id}`);
  }

  // Subject methods
  getSubjectsByEntity(entityId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/subjects/entity/${entityId}`);
  }

  getSubjectsByCourseAndClass(courseId: number, classId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/subjects/course/${courseId}/class/${classId}`);
  }

  getSubjectById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/subjects/${id}`);
  }

  createSubject(subject: Subject): Observable<any> {
    return this.http.post(`${this.apiUrl}/subjects`, subject);
  }

  updateSubject(id: number, subject: Subject): Observable<any> {
    return this.http.put(`${this.apiUrl}/subjects/${id}`, subject);
  }

  deleteSubject(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/subjects/${id}`);
  }

  // Subject-Teacher Mapping methods
  getMappingsBySubject(subjectId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/subject-teacher-mapping/subject/${subjectId}`);
  }

  getMappingsBySection(sectionId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/subject-teacher-mapping/section/${sectionId}`);
  }

  getMappingsByTeacher(teacherId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/subject-teacher-mapping/teacher/${teacherId}`);
  }

  assignTeacherToSubject(subjectId: number, teacherId: number, sectionId?: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/subject-teacher-mapping/assign`, {
      subjectId,
      teacherId,
      sectionId
    });
  }

  removeTeacherFromSubject(mappingId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/subject-teacher-mapping/${mappingId}/remove`, {});
  }

  deleteMapping(mappingId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/subject-teacher-mapping/${mappingId}`);
  }
}

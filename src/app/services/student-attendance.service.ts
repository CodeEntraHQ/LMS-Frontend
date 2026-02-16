import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StudentAttendanceService {
  private apiUrl = 'http://localhost:8080/api/attendance/student';

  constructor(private http: HttpClient) {}

  getSummary(studentId: number): Observable<any> {
    const params = new HttpParams().set('studentId', String(studentId));
    return this.http.get(`${this.apiUrl}/summary`, { params });
  }
}


import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';
import { Entity } from '../../../../services/entity.service';
import { Course, ClassEntity, Section, Subject } from '../../../../services/subject.service';
import { Teacher } from '../../../../services/teacher.service';
import { ReportService } from '../../../../services/report.service';
import { SubjectService } from '../../../../services/subject.service';

type ReportSubTab = 'academic' | 'attendance' | 'financial' | 'teacher-activity' | 'student-activity' | 'custom';

interface ReportFilters {
  courseId: string;
  classId: string;
  subjectId: string;
  sectionId: string;
  teacherId: string;
  academicYear: string;
  fromDate: string;
  toDate: string;
}

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-reports.component.html',
  styleUrls: ['./admin-reports.component.css']
})
export class AdminReportsComponent implements OnInit {
  @Input() entity!: Entity;
  @Input() courses: Course[] = [];
  @Input() teachers: Teacher[] = [];
  @Output() showSnackbar = new EventEmitter<{ message: string; type: 'success' | 'error' }>();

  reportSubTab: ReportSubTab = 'academic';
  academicSubTab: 'student-perf' | 'exam-analysis' | 'assignment' = 'student-perf';
  attendanceSubTab: 'student' | 'teacher' = 'student';

  filters: ReportFilters = {
    courseId: '', classId: '', subjectId: '', sectionId: '', teacherId: '',
    academicYear: '2025-26',
    fromDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0]
  };

  filterClasses: ClassEntity[] = [];
  filterSections: Section[] = [];
  filterSubjects: Subject[] = [];

  isLoading = false;
  studentPerfData: any = null;
  examAnalysisData: any = null;
  assignmentReportData: any = null;
  studentAttendanceData: any = null;
  teacherAttendanceData: any = null;
  financialData: any = null;
  overdueData: any = null;
  teacherActivityData: any[] = [];
  studentActivityData: any = null;
  customReportData: any = null;

  constructor(
    private reportService: ReportService,
    private subjectService: SubjectService
  ) {}

  ngOnInit(): void {
    this.onCourseChange();
  }

  get entityId(): number {
    const id = this.entity?.id;
    return typeof id === 'string' ? parseInt(id, 10) : (id || 0);
  }

  onCourseChange(): void {
    this.filters.classId = '';
    this.filters.subjectId = '';
    this.filterClasses = [];
    this.filterSubjects = [];
    if (this.filters.courseId) {
      this.subjectService.getClassesByCourse(parseInt(this.filters.courseId)).subscribe({
        next: (r: any) => {
          this.filterClasses = r?.data || (Array.isArray(r) ? r : []);
        }
      });
    }
  }

  onClassChange(): void {
    this.filters.subjectId = '';
    this.filterSubjects = [];
    if (this.filters.courseId && this.filters.classId) {
      this.subjectService.getSubjectsByCourseAndClass(
        parseInt(this.filters.courseId),
        parseInt(this.filters.classId)
      ).subscribe({
        next: (r: any) => {
          this.filterSubjects = r?.data || (Array.isArray(r) ? r : []);
        }
      });
    }
  }

  toParams(): Record<string, any> {
    const p: Record<string, any> = { entityId: this.entityId };
    const f = this.filters as unknown as Record<string, string>;
    ['courseId', 'classId', 'subjectId', 'sectionId', 'teacherId', 'academicYear', 'fromDate', 'toDate'].forEach(k => {
      if (f[k]) p[k] = f[k];
    });
    return p;
  }

  loadStudentPerformance(): void {
    this.isLoading = true;
    this.reportService.getStudentPerformance(this.toParams()).subscribe({
      next: (r: any) => {
        this.studentPerfData = r?.data || null;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; this.showSnackbar.emit({ message: 'Failed to load report', type: 'error' }); }
    });
  }

  loadExamAnalysis(): void {
    this.isLoading = true;
    this.reportService.getExamAnalysis(this.toParams()).subscribe({
      next: (r: any) => {
        this.examAnalysisData = r?.data || null;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; this.showSnackbar.emit({ message: 'Failed to load report', type: 'error' }); }
    });
  }

  loadAssignmentReport(): void {
    this.isLoading = true;
    this.reportService.getAssignmentReport(this.toParams()).subscribe({
      next: (r: any) => {
        this.assignmentReportData = r?.data || null;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; this.showSnackbar.emit({ message: 'Failed to load report', type: 'error' }); }
    });
  }

  loadStudentAttendance(): void {
    this.isLoading = true;
    this.reportService.getStudentAttendance(this.toParams()).subscribe({
      next: (r: any) => {
        this.studentAttendanceData = r?.data || null;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; this.showSnackbar.emit({ message: 'Failed to load report', type: 'error' }); }
    });
  }

  loadTeacherAttendance(): void {
    this.isLoading = true;
    this.reportService.getTeacherAttendance({
      entityId: this.entityId,
      fromDate: this.filters.fromDate,
      toDate: this.filters.toDate
    }).subscribe({
      next: (r: any) => {
        this.teacherAttendanceData = r?.data || null;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; this.showSnackbar.emit({ message: 'Failed to load report', type: 'error' }); }
    });
  }

  loadFinancial(): void {
    this.isLoading = true;
    this.reportService.getFeeSummary({
      entityId: this.entityId,
      fromDate: this.filters.fromDate,
      toDate: this.filters.toDate
    }).subscribe({
      next: (r: any) => {
        this.financialData = r?.data || null;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; this.showSnackbar.emit({ message: 'Failed to load report', type: 'error' }); }
    });
  }

  loadOverdue(): void {
    this.isLoading = true;
    this.reportService.getOverdueList(this.entityId).subscribe({
      next: (r: any) => {
        this.overdueData = r?.data || null;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; this.showSnackbar.emit({ message: 'Failed to load report', type: 'error' }); }
    });
  }

  loadTeacherActivity(): void {
    this.isLoading = true;
    this.reportService.getTeacherActivity(this.entityId).subscribe({
      next: (r: any) => {
        this.teacherActivityData = Array.isArray(r?.data) ? r.data : [];
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; this.showSnackbar.emit({ message: 'Failed to load report', type: 'error' }); }
    });
  }

  loadStudentActivity(): void {
    this.isLoading = true;
    this.reportService.getStudentActivity(this.toParams()).subscribe({
      next: (r: any) => {
        this.studentActivityData = r?.data || null;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; this.showSnackbar.emit({ message: 'Failed to load report', type: 'error' }); }
    });
  }

  loadCustomReport(reportType: string): void {
    this.isLoading = true;
    this.reportService.getCustomReport({ ...this.toParams(), reportType }).subscribe({
      next: (r: any) => {
        this.customReportData = r?.data || null;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; this.showSnackbar.emit({ message: 'Failed to load report', type: 'error' }); }
    });
  }

  private getExportData(): { title: string; headers: string[]; rows: string[][] } | null {
    if (this.reportSubTab === 'academic') {
      if (this.academicSubTab === 'student-perf' && this.studentPerfData) {
        const s = this.studentPerfData.summary || {};
        const classData = this.studentPerfData.classWiseResult || [];
        const headers = ['Class', 'Passed', 'Failed', 'Pass %'];
        const rows = classData.map((r: any) => [
          this.getClassName(r.classId),
          String(r.passed ?? ''),
          String(r.failed ?? ''),
          this.formatNum(r.passRatio) + '%'
        ]);
        rows.unshift([`Summary: Passed=${s.totalPassed ?? 0}, Failed=${s.totalFailed ?? 0}, Pass Ratio=${this.formatNum(s.overallPassRatio)}%, Avg=${this.formatNum(s.overallAverage)}`]);
        return { title: 'Student Performance Report', headers, rows };
      }
      if (this.academicSubTab === 'exam-analysis' && this.examAnalysisData?.exams?.length) {
        const headers = ['Exam', 'Type', 'Date', 'Passed', 'Failed', 'Avg', 'Attempted', 'Absent'];
        const rows = this.examAnalysisData.exams.map((e: any) => [
          String(e.examName ?? ''),
          String(e.examType ?? ''),
          String(e.examDate ?? ''),
          String(e.passed ?? ''),
          String(e.failed ?? ''),
          this.formatNum(e.averageMarks),
          String(e.attempted ?? ''),
          String(e.absent ?? '')
        ]);
        return { title: 'Exam Analysis Report', headers, rows };
      }
      if (this.academicSubTab === 'assignment' && this.assignmentReportData) {
        const o = this.assignmentReportData.overview || {};
        const headers = ['Metric', 'Value'];
        const rows = [
          ['Total Assignments', String(o.totalAssignments ?? '-')],
          ['Completion %', this.formatNum(o.submissionPercentage) + '%'],
          ['Pending Evaluations', String(o.pendingEvaluations ?? '-')]
        ];
        return { title: 'Assignment Report', headers, rows };
      }
    }
    if (this.reportSubTab === 'attendance') {
      if (this.attendanceSubTab === 'student' && this.studentAttendanceData) {
        const o = this.studentAttendanceData.overview || {};
        const reports = this.studentAttendanceData.studentReports || [];
        const headers = ['Student ID', 'Total', 'Present', 'Percent'];
        const rows = reports.slice(0, 100).map((r: any) => [
          String(r.studentId ?? ''),
          String(r.total ?? ''),
          String(r.present ?? ''),
          this.formatNum(r.percent) + '%'
        ]);
        if (rows.length === 0) {
          rows.push([`Overall: ${this.formatNum(o.attendancePercentage)}%`, String(o.presentEntries ?? ''), String(o.totalEntries ?? '')]);
        }
        return { title: 'Student Attendance Report', headers, rows };
      }
      if (this.attendanceSubTab === 'teacher' && this.teacherAttendanceData) {
        const reports = this.teacherAttendanceData.reports || [];
        const headers = ['Teacher', 'Present', 'Absent', 'Leave', 'Half-Day', 'Total', 'Percent'];
        const rows = reports.slice(0, 50).map((r: any) => [
          String(r.name ?? this.getTeacherName(r.teacherId) ?? ''),
          String(r.present ?? ''),
          String(r.absent ?? ''),
          String(r.leave ?? ''),
          String(r.halfDay ?? ''),
          String(r.total ?? ''),
          this.formatNum(r.percentage) + '%'
        ]);
        return { title: 'Teacher Attendance Report', headers, rows };
      }
    }
    if (this.reportSubTab === 'financial') {
      const allRows: string[][] = [];
      if (this.financialData) {
        allRows.push(['Total Collected', '₹' + this.formatNum(this.financialData.totalCollection)]);
        allRows.push(['Total Pending', '₹' + this.formatNum(this.financialData.totalPending)]);
        allRows.push(['Overdue Count', String(this.financialData.overdueCount ?? 0)]);
      }
      if (this.overdueData?.items?.length) {
        allRows.push([]);
        allRows.push(['Student ID', 'Pending Amount', 'Due Date']);
        this.overdueData.items.forEach((o: any) => {
          allRows.push([String(o.studentId), '₹' + this.formatNum(o.pendingAmount), String(o.dueDate ?? '')]);
        });
      }
      if (allRows.length) return { title: 'Financial Report', headers: ['Metric', 'Value'], rows: allRows };
    }
    if (this.reportSubTab === 'teacher-activity' && this.teacherActivityData?.length) {
      const headers = ['Teacher', 'Exams Created', 'Assignments Given'];
      const rows = this.teacherActivityData.map((t: any) => [
        this.getTeacherName(t.teacherId),
        String(t.examsCreated ?? ''),
        String(t.assignmentsGiven ?? '')
      ]);
      return { title: 'Teacher Activity Report', headers, rows };
    }
    if (this.reportSubTab === 'student-activity' && this.studentActivityData) {
      const ea = this.studentActivityData.examAttempts || {};
      const headers = ['Metric', 'Value'];
      const rows = [
        ['Exam Attempts', String(ea.totalAttempts ?? '-')],
        ['Exam Submissions', String(ea.totalSubmissions ?? '-')],
        ['Assignment Submissions', String(this.studentActivityData.assignmentSubmissions ?? '-')]
      ];
      return { title: 'Student Activity Report', headers, rows };
    }
    return null;
  }

  exportPdf(): void {
    const data = this.getExportData();
    if (!data || (!data.rows.length && !data.headers.length)) {
      this.showSnackbar.emit({ message: 'Generate report first to export PDF', type: 'error' });
      return;
    }
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm' });
      doc.setFontSize(16);
      doc.text(data.title, 14, 20);
      doc.setFontSize(10);
      let y = 32;
      if (data.headers.length) {
        doc.setFont(undefined as any, 'bold');
        doc.text(data.headers.join(' | '), 14, y);
        y += 8;
        doc.setFont(undefined as any, 'normal');
      }
      for (const row of data.rows) {
        if (y > 270) { doc.addPage(); y = 20; }
        const text = Array.isArray(row) ? row.join(' | ') : String(row);
        doc.text(text.substring(0, 90), 14, y);
        y += 6;
      }
      doc.save(data.title.replace(/\s+/g, '_') + '_' + new Date().toISOString().slice(0, 10) + '.pdf');
      this.showSnackbar.emit({ message: 'PDF exported successfully', type: 'success' });
    } catch (e: any) {
      this.showSnackbar.emit({ message: 'Failed to export PDF: ' + (e?.message || 'Unknown error'), type: 'error' });
    }
  }

  exportExcel(): void {
    const data = this.getExportData();
    if (!data || (!data.rows.length && !data.headers.length)) {
      this.showSnackbar.emit({ message: 'Generate report first to export Excel', type: 'error' });
      return;
    }
    try {
      const escapeCsv = (v: string) => {
        const s = String(v ?? '');
        if (s.includes(',') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"';
        return s;
      };
      const lines: string[] = [];
      if (data.headers.length) lines.push(data.headers.map(escapeCsv).join(','));
      for (const row of data.rows) {
        const cells = Array.isArray(row) ? row : [String(row)];
        lines.push(cells.map(escapeCsv).join(','));
      }
      const csv = '\uFEFF' + lines.join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.title.replace(/\s+/g, '_') + '_' + new Date().toISOString().slice(0, 10) + '.csv';
      a.click();
      URL.revokeObjectURL(url);
      this.showSnackbar.emit({ message: 'Excel (CSV) exported successfully', type: 'success' });
    } catch (e: any) {
      this.showSnackbar.emit({ message: 'Failed to export Excel: ' + (e?.message || 'Unknown error'), type: 'error' });
    }
  }

  getTeacherName(id?: number): string {
    const t = this.teachers.find(t => t.id === id);
    return t ? `${t.firstName || ''} ${t.lastName || ''}`.trim() : `Teacher #${id}`;
  }

  getClassName(id?: number): string {
    return this.filterClasses.find(c => c.id === id)?.name || this.courses.find(c => c.id === id)?.name || `#${id}`;
  }

  formatNum(v: any): string {
    if (v == null) return '-';
    if (typeof v === 'number') return v.toFixed(2);
    return String(v);
  }
}

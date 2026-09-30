import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
  index,
  primaryKey,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

/* -------------------------------------------------------------------------- */
/*  Enums (kept as string literals — Drizzle SQLite has no native enum type)  */
/* -------------------------------------------------------------------------- */

export const ROLES = ["super_admin", "school_admin", "teacher", "student"] as const;
export type Role = (typeof ROLES)[number];

export const GENDERS = ["male", "female", "other"] as const;
export type Gender = (typeof GENDERS)[number];

export const ENROLLMENT_STATUS = ["active", "graduated", "transferred", "dropped"] as const;
export type EnrollmentStatus = (typeof ENROLLMENT_STATUS)[number];

export const EXAM_TERMS = ["midterm", "final", "monthly", "annual", "quiz"] as const;
export type ExamTerm = (typeof EXAM_TERMS)[number];

export const BOOK_ISSUE_STATUS = ["issued", "returned", "overdue", "lost"] as const;
export type BookIssueStatus = (typeof BOOK_ISSUE_STATUS)[number];

export const ATTENDANCE_STATUS = ["present", "absent", "late", "excused"] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUS)[number];

/* -------------------------------------------------------------------------- */
/*  1. Schools                                                                */
/* -------------------------------------------------------------------------- */

export const schools = sqliteTable(
  "schools",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    address: text("address"),
    contactEmail: text("contact_email"),
    contactPhone: text("contact_phone"),
    logoUrl: text("logo_url"),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s','now'))`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s','now'))`),
  },
  (t) => [uniqueIndex("schools_name_idx").on(t.name)]
);

export type School = typeof schools.$inferSelect;
export type NewSchool = typeof schools.$inferInsert;

/* -------------------------------------------------------------------------- */
/*  2. Users  +  3. userRoles (many-to-many)                                  */
/* -------------------------------------------------------------------------- */

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    schoolId: text("school_id").references(() => schools.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    fullName: text("full_name").notNull(),
    phone: text("phone"),
    avatarUrl: text("avatar_url"),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    /** Convenience single-role column used by NextAuth JWT. Mirrors first row of userRoles. */
    primaryRole: text("primary_role").$type<Role>().notNull(),
    lastLoginAt: integer("last_login_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s','now'))`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s','now'))`),
  },
  (t) => [uniqueIndex("users_email_idx").on(t.email)]
);

export const userRoles = sqliteTable(
  "user_roles",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").$type<Role>().notNull(),
    schoolId: text("school_id").references(() => schools.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s','now'))`),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.role] }),
    index("user_roles_role_idx").on(t.role),
  ]
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserRole = typeof userRoles.$inferSelect;

/* -------------------------------------------------------------------------- */
/*  4. Students                                                               */
/* -------------------------------------------------------------------------- */

export const students = sqliteTable(
  "students",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    schoolId: text("school_id")
      .notNull()
      .references(() => schools.id, { onDelete: "cascade" }),
    admissionNo: text("admission_no").notNull(),
    dateOfBirth: integer("date_of_birth", { mode: "timestamp" }),
    gender: text("gender").$type<Gender>(),
    currentClassId: text("current_class_id").references(() => classes.id, { onDelete: "set null" }),
    guardianName: text("guardian_name"),
    guardianPhone: text("guardian_phone"),
    address: text("address"),
    enrollmentDate: integer("enrollment_date", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s','now'))`),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s','now'))`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s','now'))`),
  },
  (t) => [
    uniqueIndex("students_admission_idx").on(t.schoolId, t.admissionNo),
    uniqueIndex("students_user_idx").on(t.userId),
    index("students_school_idx").on(t.schoolId),
  ]
);

export type Student = typeof students.$inferSelect;
export type NewStudent = typeof students.$inferInsert;

/* -------------------------------------------------------------------------- */
/*  5. Teachers                                                               */
/* -------------------------------------------------------------------------- */

export const teachers = sqliteTable(
  "teachers",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    schoolId: text("school_id")
      .notNull()
      .references(() => schools.id, { onDelete: "cascade" }),
    employeeId: text("employee_id").notNull(),
    qualification: text("qualification"),
    specialization: text("specialization"),
    hireDate: integer("hire_date", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s','now'))`),
    salary: integer("salary"), // stored as cents to avoid float drift
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s','now'))`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s','now'))`),
  },
  (t) => [
    uniqueIndex("teachers_employee_idx").on(t.schoolId, t.employeeId),
    uniqueIndex("teachers_user_idx").on(t.userId),
    index("teachers_school_idx").on(t.schoolId),
  ]
);

export type Teacher = typeof teachers.$inferSelect;
export type NewTeacher = typeof teachers.$inferInsert;

/* -------------------------------------------------------------------------- */
/*  6. Classes                                                                */
/* -------------------------------------------------------------------------- */

export const classes = sqliteTable(
  "classes",
  {
    id: text("id").primaryKey(),
    schoolId: text("school_id")
      .notNull()
      .references(() => schools.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    gradeLevel: integer("grade_level").notNull(),
    section: text("section").notNull().default("A"),
    capacity: integer("capacity").notNull().default(40),
    classTeacherId: text("class_teacher_id").references(() => teachers.id, {
      onDelete: "set null",
    }),
    academicYear: text("academic_year").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s','now'))`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s','now'))`),
  },
  (t) => [
    uniqueIndex("classes_unique_idx").on(t.schoolId, t.name, t.section, t.academicYear),
    index("classes_school_idx").on(t.schoolId),
  ]
);

export type Class = typeof classes.$inferSelect;
export type NewClass = typeof classes.$inferInsert;

/* -------------------------------------------------------------------------- */
/*  7. Subjects                                                               */
/* -------------------------------------------------------------------------- */

export const subjects = sqliteTable(
  "subjects",
  {
    id: text("id").primaryKey(),
    schoolId: text("school_id")
      .notNull()
      .references(() => schools.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    code: text("code").notNull(),
    description: text("description"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s','now'))`),
  },
  (t) => [
    uniqueIndex("subjects_code_idx").on(t.schoolId, t.code),
    index("subjects_school_idx").on(t.schoolId),
  ]
);

export type Subject = typeof subjects.$inferSelect;
export type NewSubject = typeof subjects.$inferInsert;

/* -------------------------------------------------------------------------- */
/*  8. classSubjects (subject ↔ class ↔ teacher)                              */
/* -------------------------------------------------------------------------- */

export const classSubjects = sqliteTable(
  "class_subjects",
  {
    id: text("id").primaryKey(),
    classId: text("class_id")
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),
    subjectId: text("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    teacherId: text("teacher_id").references(() => teachers.id, { onDelete: "set null" }),
    periodsPerWeek: integer("periods_per_week").notNull().default(4),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s','now'))`),
  },
  (t) => [
    uniqueIndex("class_subjects_unique_idx").on(t.classId, t.subjectId),
    index("class_subjects_teacher_idx").on(t.teacherId),
  ]
);

export type ClassSubject = typeof classSubjects.$inferSelect;
export type NewClassSubject = typeof classSubjects.$inferInsert;

/* -------------------------------------------------------------------------- */
/*  9. Enrollments (student ↔ class per academic year)                        */
/* -------------------------------------------------------------------------- */

export const enrollments = sqliteTable(
  "enrollments",
  {
    id: text("id").primaryKey(),
    studentId: text("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    classId: text("class_id")
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),
    academicYear: text("academic_year").notNull(),
    status: text("status").$type<EnrollmentStatus>().notNull().default("active"),
    enrolledAt: integer("enrolled_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s','now'))`),
    leftAt: integer("left_at", { mode: "timestamp" }),
  },
  (t) => [
    uniqueIndex("enrollments_unique_idx").on(t.studentId, t.classId, t.academicYear),
    index("enrollments_class_idx").on(t.classId),
    index("enrollments_status_idx").on(t.status),
  ]
);

export type Enrollment = typeof enrollments.$inferSelect;
export type NewEnrollment = typeof enrollments.$inferInsert;

/* -------------------------------------------------------------------------- */
/*  10. Exams  +  11. examSubjects                                            */
/* -------------------------------------------------------------------------- */

export const exams = sqliteTable(
  "exams",
  {
    id: text("id").primaryKey(),
    schoolId: text("school_id")
      .notNull()
      .references(() => schools.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    term: text("term").$type<ExamTerm>().notNull(),
    academicYear: text("academic_year").notNull(),
    startDate: integer("start_date", { mode: "timestamp" }).notNull(),
    endDate: integer("end_date", { mode: "timestamp" }).notNull(),
    description: text("description"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s','now'))`),
  },
  (t) => [
    uniqueIndex("exams_unique_idx").on(t.schoolId, t.name, t.term, t.academicYear),
    index("exams_school_idx").on(t.schoolId),
  ]
);

export type Exam = typeof exams.$inferSelect;
export type NewExam = typeof exams.$inferInsert;

export const examSubjects = sqliteTable(
  "exam_subjects",
  {
    id: text("id").primaryKey(),
    examId: text("exam_id")
      .notNull()
      .references(() => exams.id, { onDelete: "cascade" }),
    subjectId: text("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    classId: text("class_id")
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),
    maxMarks: integer("max_marks").notNull().default(100),
    passMarks: integer("pass_marks").notNull().default(40),
    examDate: integer("exam_date", { mode: "timestamp" }),
  },
  (t) => [
    uniqueIndex("exam_subjects_unique_idx").on(t.examId, t.subjectId, t.classId),
    index("exam_subjects_class_idx").on(t.classId),
  ]
);

export type ExamSubject = typeof examSubjects.$inferSelect;
export type NewExamSubject = typeof examSubjects.$inferInsert;

/* -------------------------------------------------------------------------- */
/*  12. examResults                                                           */
/* -------------------------------------------------------------------------- */

export const examResults = sqliteTable(
  "exam_results",
  {
    id: text("id").primaryKey(),
    examId: text("exam_id")
      .notNull()
      .references(() => exams.id, { onDelete: "cascade" }),
    examSubjectId: text("exam_subject_id")
      .notNull()
      .references(() => examSubjects.id, { onDelete: "cascade" }),
    studentId: text("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    marksObtained: integer("marks_obtained").notNull(),
    grade: text("grade"),
    remarks: text("remarks"),
    enteredBy: text("entered_by").references(() => teachers.id, { onDelete: "set null" }),
    enteredAt: integer("entered_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s','now'))`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s','now'))`),
  },
  (t) => [
    uniqueIndex("exam_results_unique_idx").on(t.examSubjectId, t.studentId),
    index("exam_results_student_idx").on(t.studentId),
  ]
);

export type ExamResult = typeof examResults.$inferSelect;
export type NewExamResult = typeof examResults.$inferInsert;

/* -------------------------------------------------------------------------- */
/*  13. reportCards                                                           */
/* -------------------------------------------------------------------------- */

export const reportCards = sqliteTable(
  "report_cards",
  {
    id: text("id").primaryKey(),
    examId: text("exam_id")
      .notNull()
      .references(() => exams.id, { onDelete: "cascade" }),
    studentId: text("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    totalMarks: integer("total_marks").notNull(),
    obtainedMarks: integer("obtained_marks").notNull(),
    percentage: integer("percentage").notNull(), // store as basis points (×100) to keep integer
    grade: text("grade"),
    rank: integer("rank"),
    generatedAt: integer("generated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s','now'))`),
  },
  (t) => [
    uniqueIndex("report_cards_unique_idx").on(t.examId, t.studentId),
    index("report_cards_student_idx").on(t.studentId),
  ]
);

export type ReportCard = typeof reportCards.$inferSelect;
export type NewReportCard = typeof reportCards.$inferInsert;

/* -------------------------------------------------------------------------- */
/*  14. Books                                                                 */
/* -------------------------------------------------------------------------- */

export const books = sqliteTable(
  "books",
  {
    id: text("id").primaryKey(),
    schoolId: text("school_id")
      .notNull()
      .references(() => schools.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    author: text("author").notNull(),
    isbn: text("isbn"),
    totalCopies: integer("total_copies").notNull().default(1),
    availableCopies: integer("available_copies").notNull().default(1),
    shelfLocation: text("shelf_location"),
    category: text("category"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s','now'))`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s','now'))`),
  },
  (t) => [
    index("books_school_idx").on(t.schoolId),
    index("books_title_idx").on(t.title),
  ]
);

export type Book = typeof books.$inferSelect;
export type NewBook = typeof books.$inferInsert;

/* -------------------------------------------------------------------------- */
/*  15. bookIssues                                                            */
/* -------------------------------------------------------------------------- */

export const bookIssues = sqliteTable(
  "book_issues",
  {
    id: text("id").primaryKey(),
    bookId: text("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    issuedBy: text("issued_by").references(() => users.id, { onDelete: "set null" }),
    issuedAt: integer("issued_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s','now'))`),
    dueDate: integer("due_date", { mode: "timestamp" }).notNull(),
    returnedAt: integer("returned_at", { mode: "timestamp" }),
    fineAmount: integer("fine_amount").notNull().default(0), // cents
    status: text("status").$type<BookIssueStatus>().notNull().default("issued"),
    notes: text("notes"),
  },
  (t) => [
    index("book_issues_book_idx").on(t.bookId),
    index("book_issues_user_idx").on(t.userId),
    index("book_issues_status_idx").on(t.status),
    index("book_issues_due_idx").on(t.dueDate),
  ]
);

export type BookIssue = typeof bookIssues.$inferSelect;
export type NewBookIssue = typeof bookIssues.$inferInsert;

/* -------------------------------------------------------------------------- */
/*  16. attendance  +  17. attendanceEntries                                  */
/* -------------------------------------------------------------------------- */

export const attendance = sqliteTable(
  "attendance",
  {
    id: text("id").primaryKey(),
    schoolId: text("school_id")
      .notNull()
      .references(() => schools.id, { onDelete: "cascade" }),
    classId: text("class_id")
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),
    date: integer("date", { mode: "timestamp" }).notNull(),
    takenBy: text("taken_by").references(() => teachers.id, { onDelete: "set null" }),
    notes: text("notes"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s','now'))`),
  },
  (t) => [
    uniqueIndex("attendance_class_date_idx").on(t.classId, t.date),
    index("attendance_school_idx").on(t.schoolId),
  ]
);

export type Attendance = typeof attendance.$inferSelect;
export type NewAttendance = typeof attendance.$inferInsert;

export const attendanceEntries = sqliteTable(
  "attendance_entries",
  {
    id: text("id").primaryKey(),
    attendanceId: text("attendance_id")
      .notNull()
      .references(() => attendance.id, { onDelete: "cascade" }),
    studentId: text("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    status: text("status").$type<AttendanceStatus>().notNull(),
    remarks: text("remarks"),
  },
  (t) => [
    uniqueIndex("attendance_entries_unique_idx").on(t.attendanceId, t.studentId),
    index("attendance_entries_student_idx").on(t.studentId),
  ]
);

export type AttendanceEntry = typeof attendanceEntries.$inferSelect;
export type NewAttendanceEntry = typeof attendanceEntries.$inferInsert;

/* -------------------------------------------------------------------------- */
/*  18. auditLogs                                                             */
/* -------------------------------------------------------------------------- */

export const auditLogs = sqliteTable(
  "audit_logs",
  {
    id: text("id").primaryKey(),
    actorId: text("actor_id").references(() => users.id, { onDelete: "set null" }),
    schoolId: text("school_id").references(() => schools.id, { onDelete: "cascade" }),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id"),
    payload: text("payload"), // JSON-encoded
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s','now'))`),
  },
  (t) => [
    index("audit_actor_idx").on(t.actorId),
    index("audit_entity_idx").on(t.entityType, t.entityId),
    index("audit_school_idx").on(t.schoolId),
  ]
);

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;

/* -------------------------------------------------------------------------- */
/*  Relations (used by Drizzle relational query API)                          */
/* -------------------------------------------------------------------------- */

export const schoolsRelations = relations(schools, ({ many }) => ({
  users: many(users),
  students: many(students),
  teachers: many(teachers),
  classes: many(classes),
  subjects: many(subjects),
  exams: many(exams),
  books: many(books),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  school: one(schools, { fields: [users.schoolId], references: [schools.id] }),
  roles: many(userRoles),
  student: one(students, { fields: [users.id], references: [students.userId] }),
  teacher: one(teachers, { fields: [users.id], references: [teachers.userId] }),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(users, { fields: [students.userId], references: [users.id] }),
  school: one(schools, { fields: [students.schoolId], references: [schools.id] }),
  currentClass: one(classes, {
    fields: [students.currentClassId],
    references: [classes.id],
  }),
  enrollments: many(enrollments),
  examResults: many(examResults),
  reportCards: many(reportCards),
}));

export const teachersRelations = relations(teachers, ({ one, many }) => ({
  user: one(users, { fields: [teachers.userId], references: [users.id] }),
  school: one(schools, { fields: [teachers.schoolId], references: [schools.id] }),
  classAssignments: many(classSubjects),
  classesAsClassTeacher: many(classes),
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  school: one(schools, { fields: [classes.schoolId], references: [schools.id] }),
  classTeacher: one(teachers, {
    fields: [classes.classTeacherId],
    references: [teachers.id],
  }),
  subjects: many(classSubjects),
  enrollments: many(enrollments),
  students: many(students),
}));

export const subjectsRelations = relations(subjects, ({ one, many }) => ({
  school: one(schools, { fields: [subjects.schoolId], references: [schools.id] }),
  classSubjects: many(classSubjects),
}));

export const classSubjectsRelations = relations(classSubjects, ({ one }) => ({
  class: one(classes, { fields: [classSubjects.classId], references: [classes.id] }),
  subject: one(subjects, { fields: [classSubjects.subjectId], references: [subjects.id] }),
  teacher: one(teachers, { fields: [classSubjects.teacherId], references: [teachers.id] }),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  student: one(students, { fields: [enrollments.studentId], references: [students.id] }),
  class: one(classes, { fields: [enrollments.classId], references: [classes.id] }),
}));

export const examsRelations = relations(exams, ({ one, many }) => ({
  school: one(schools, { fields: [exams.schoolId], references: [schools.id] }),
  examSubjects: many(examSubjects),
  results: many(examResults),
  reportCards: many(reportCards),
}));

export const examSubjectsRelations = relations(examSubjects, ({ one, many }) => ({
  exam: one(exams, { fields: [examSubjects.examId], references: [exams.id] }),
  subject: one(subjects, { fields: [examSubjects.subjectId], references: [subjects.id] }),
  class: one(classes, { fields: [examSubjects.classId], references: [classes.id] }),
  results: many(examResults),
}));

export const examResultsRelations = relations(examResults, ({ one }) => ({
  exam: one(exams, { fields: [examResults.examId], references: [exams.id] }),
  examSubject: one(examSubjects, {
    fields: [examResults.examSubjectId],
    references: [examSubjects.id],
  }),
  student: one(students, { fields: [examResults.studentId], references: [students.id] }),
  enteredByTeacher: one(teachers, {
    fields: [examResults.enteredBy],
    references: [teachers.id],
  }),
}));

export const reportCardsRelations = relations(reportCards, ({ one }) => ({
  exam: one(exams, { fields: [reportCards.examId], references: [exams.id] }),
  student: one(students, { fields: [reportCards.studentId], references: [students.id] }),
}));

export const booksRelations = relations(books, ({ one, many }) => ({
  school: one(schools, { fields: [books.schoolId], references: [schools.id] }),
  issues: many(bookIssues),
}));

export const bookIssuesRelations = relations(bookIssues, ({ one }) => ({
  book: one(books, { fields: [bookIssues.bookId], references: [books.id] }),
  user: one(users, { fields: [bookIssues.userId], references: [users.id] }),
  issuedByUser: one(users, { fields: [bookIssues.issuedBy], references: [users.id] }),
}));

export const attendanceRelations = relations(attendance, ({ one, many }) => ({
  school: one(schools, { fields: [attendance.schoolId], references: [schools.id] }),
  class: one(classes, { fields: [attendance.classId], references: [classes.id] }),
  takenByTeacher: one(teachers, { fields: [attendance.takenBy], references: [teachers.id] }),
  entries: many(attendanceEntries),
}));

export const attendanceEntriesRelations = relations(attendanceEntries, ({ one }) => ({
  attendance: one(attendance, {
    fields: [attendanceEntries.attendanceId],
    references: [attendance.id],
  }),
  student: one(students, {
    fields: [attendanceEntries.studentId],
    references: [students.id],
  }),
}));

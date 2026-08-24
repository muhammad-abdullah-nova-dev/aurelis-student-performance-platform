# PROTECTED IDENTIFIERS

## ⚠️ CRITICAL WARNING

**DO NOT RENAME OR MODIFY THESE IDENTIFIERS WITHOUT UNDERSTANDING THE FULL IMPACT**

These identifiers represent **backend contracts**, **database relationships**, and **behavior-critical DOM elements**. Changing them will break functionality, cause data loss, or create security vulnerabilities.

---

## DATABASE TABLES (DO NOT RENAME)

### Core Tables
- `ta_profiles` - TA identity and account information
- `classes` - Individual classes/courses
- `students` - Student enrollments
- `mark_categories` - Grade column definitions (Quiz 1, Assignment 2, etc.)
- `marks` - Individual student grades
- `mark_queries` - Student questions about marks
- `pending_tas` - **DEPRECATED** (old approval system)
- `teachers` - **UNUSED** (unclear purpose)

### Table Relationships
**FOREIGN KEY CONSTRAINTS** - Breaking these causes cascade failures:
- `classes.ta_id` → `ta_profiles.id` (ON DELETE CASCADE)
- `students.ta_id` → `ta_profiles.id` (ON DELETE CASCADE)
- `students.class_id` → `classes.id` (ON DELETE CASCADE)
- `mark_categories.ta_id` → `ta_profiles.id` (ON DELETE CASCADE)
- `mark_categories.class_id` → `classes.id` (ON DELETE CASCADE)
- `marks.student_id` → `students.id` (ON DELETE CASCADE)
- `marks.ta_id` → `ta_profiles.id` (ON DELETE CASCADE)
- `marks.category_id` → `mark_categories.id` (ON DELETE SET NULL)
- `mark_queries.student_id` → `students.id` (ON DELETE CASCADE)
- `mark_queries.ta_id` → `ta_profiles.id` (ON DELETE CASCADE)
- `mark_queries.category_id` → `mark_categories.id` (ON DELETE CASCADE)

---

## DATABASE COLUMNS (DO NOT RENAME)

### ta_profiles
- `id` (uuid, PK) - **CRITICAL**: Matches auth.users.id
- `ta_name` (text) - TA's display name
- `email` (text, UNIQUE) - Login email
- `avatar_url` (text) - Profile picture URL
- `sir_name` (text) - **DEPRECATED**: Now in classes table
- `course` (text) - **DEPRECATED**: Now classes.name
- `class_link_token` (text, UNIQUE) - **DEPRECATED**: Now in classes table
- `google_sheet_url` (text) - **DEPRECATED**: Now in classes table
- `created_at` (timestamp)

### classes
- `id` (uuid, PK)
- `ta_id` (uuid, FK) - **CRITICAL**: Links to ta_profiles
- `name` (text) - Course/class name
- `sir_name` (text) - Instructor name
- `class_link_token` (text, UNIQUE) - **CRITICAL**: Student invite link token
- `teacher_view_token` (text, UNIQUE) - **CRITICAL**: Instructor read-only link token
- `google_sheet_url` (text) - Synced Google Sheet URL
- `marks_visible` (boolean) - Controls student marks visibility
- `created_at` (timestamp)

### students
- `id` (uuid, PK)
- `ta_id` (uuid, FK) - **CRITICAL**: Links to ta_profiles
- `class_id` (uuid, FK) - **CRITICAL**: Links to classes
- `name` (text) - Student full name
- `roll_no` (text) - **CRITICAL**: Student identifier, UNIQUE per (ta_id, roll_no) or (class_id, roll_no)
- `email` (text, nullable) - Student email
- `status` (text) - **CRITICAL VALUES**: 'pending' | 'approved' | 'rejected'
- `created_at` (timestamp)

### mark_categories
- `id` (uuid, PK) - **CRITICAL**: Referenced by marks and mark_queries
- `ta_id` (uuid, FK)
- `class_id` (uuid, FK) - **CRITICAL**: Links to classes
- `name` (text) - Category display name (e.g., "Quiz 1")
- `total` (numeric) - Maximum marks for this category
- `created_at` (timestamp)

### marks
- `id` (uuid, PK)
- `student_id` (uuid, FK) - **CRITICAL**: Links to students
- `ta_id` (uuid, FK)
- `category_id` (uuid, FK) - **CRITICAL**: Links to mark_categories
- `subject` (text) - **DEPRECATED**: Now mark_categories.name
- `marks` (numeric, nullable) - Student's score
- `total` (numeric) - **DEPRECATED**: Now mark_categories.total
- `remarks` (text) - TA comments
- `created_at` (timestamp)

### mark_queries
- `id` (uuid, PK)
- `student_id` (uuid, FK) - **CRITICAL**: Links to students
- `ta_id` (uuid, FK)
- `category_id` (uuid, FK) - **CRITICAL**: Links to mark_categories
- `message` (text) - Student's question
- `photo_urls` (text[]) - **CRITICAL TYPE**: PostgreSQL array of strings
- `resolved` (boolean) - Query status
- `reply` (text, nullable) - TA's response
- `replied_at` (timestamp, nullable)
- `created_at` (timestamp)

---

## POSTGRESQL FUNCTIONS (DO NOT RENAME)

### generate_class_token()
**Purpose**: Generate random 16-byte hex token for class/teacher links
**Returns**: text
**Used by**: 
- create-ta-profile Edge Function
- dashboard.html (generateLink, generateTeacherLink)

### generate_approval_token()
**Purpose**: Generate token for TA approval emails (**DEPRECATED**)
**Returns**: text
**Status**: No longer used in current flow

---

## EDGE FUNCTIONS (DO NOT RENAME)

### Function Names
- `check-roll-taken` - Verify roll number availability
- `cleanup-failed-signup` - Auth recovery mechanism
- `create-ta-profile` - Signup completion
- `get-student-marks` - Secure student data retrieval
- `get-ta-by-token` - Validate class tokens
- `get-teacher-dashboard` - Instructor progress view
- `send-marks-email` - Email notifications

### Edge Function Endpoints (URL Pattern)
```
https://loxxobhsyhqaslpqqrqe.supabase.co/functions/v1/<FUNCTION_NAME>
```

### Edge Function Request/Response Contracts

#### check-roll-taken
**Request**: `{ class_id: uuid, roll_no: string }`
**Response**: `{ taken: boolean }` or `{ error: string }`

#### cleanup-failed-signup
**Request**: `{ auth_user_id: uuid }`
**Response**: `{ success: boolean }` or `{ error: string }`

#### create-ta-profile
**Request**: `{ ta_name: string, ta_email: string, course: string, sir_name?: string, auth_user_id: uuid }`
**Response**: `{ success: true, class_id: uuid, class_link_token: string }` or `{ error: string }`

#### get-student-marks
**Request**: `{ class_token: string, roll_no: string }`
**Response**: 
```json
{
  "status": "pending|approved|rejected",
  "name": "string",
  "student_id?": "uuid",
  "marks_visible?": boolean,
  "marks?": [
    {
      "category_id": "uuid",
      "name": "string",
      "marks": number,
      "total": number,
      "highest": number,
      "lowest": number,
      "average": number,
      "queries": [...]
    }
  ]
}
```

#### get-ta-by-token
**Request**: `{ token: string }` (class_link_token)
**Response**: TA and class information
**Note**: Current implementation appears incorrect (duplicates get-student-marks)

#### get-teacher-dashboard
**Request**: `{ token: string }` (teacher_view_token)
**Response**: 
```json
{
  "class_name": "string",
  "sir_name": "string",
  "ta_name": "string",
  "total_students": number,
  "graded_students": number,
  "class_average": number,
  "quizzes": [
    {
      "id": "uuid",
      "name": "string",
      "total": number,
      "average": number,
      "highest": number,
      "lowest": number,
      "above_avg_pct": number,
      "below_avg_pct": number,
      "graded_count": number,
      "top5": [{name, roll_no, marks}],
      "bottom5": [{name, roll_no, marks}],
      "all": [{name, roll_no, marks}]
    }
  ]
}
```

#### send-marks-email
**Request**: `{ student_name, student_email, ta_name, sir_name, course, category, marks, total, remarks, is_reminder }`
**Response**: `{ success: boolean }` or `{ error: string }`

---

## SUPABASE STORAGE BUCKETS (DO NOT RENAME)

### mark-query-photos
**Purpose**: Store student query attachments
**Access**: Public URLs
**Used by**: join.html (submitQuery function)

### avatars
**Purpose**: Store TA profile pictures
**Access**: Public URLs
**Path pattern**: `{ta_id}/avatar.{ext}`
**Used by**: dashboard.html (uploadAvatar function)

---

## ENVIRONMENT VARIABLES (DO NOT RENAME)

### Supabase Edge Functions
- `SUPABASE_URL` - Project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Admin access key
- `SUPABASE_ANON_KEY` - Public client key (embedded in HTML)

### External Services
- `RESEND_API_KEY` - Email sending service (send-marks-email function)

---

## DOM IDs (BEHAVIOR-CRITICAL - DO NOT RENAME)

### Authentication Pages

#### login.html
- `login-email` - Login email input
- `login-password` - Login password input
- `login-btn` - Login submit button
- `login-error` - Login error alert
- `login-success` - Login success alert
- `login-spinner` - Login loading indicator
- `login-btn-text` - Login button text
- `signup-ta-name` - Signup TA name input
- `signup-sir-name` - Signup instructor name input
- `signup-course` - Signup course input
- `signup-email` - Signup email input
- `signup-password` - Signup password input
- `signup-btn` - Signup submit button
- `signup-error` - Signup error alert
- `signup-spinner` - Signup loading indicator
- `signup-btn-text` - Signup button text
- `forgot-email` - Forgot password email input
- `forgot-btn` - Forgot password submit button
- `forgot-error` - Forgot password alert
- `forgot-spinner` - Forgot password loading indicator
- `forgot-btn-text` - Forgot password button text
- `strength-wrap` - Password strength container
- `strength-fill` - Password strength bar fill
- `strength-label` - Password strength label
- `panel-login` - Login panel container
- `panel-signup` - Signup panel container
- `panel-forgot` - Forgot password panel container

#### reset-password.html
- `new-password` - New password input
- `confirm-password` - Confirm password input
- `reset-btn` - Reset submit button
- `reset-error` - Reset error alert
- `reset-spinner` - Reset loading indicator
- `reset-btn-text` - Reset button text
- `reset-sub` - Reset subtitle text
- `reset-form` - Reset form container

### Student Pages

#### join.html
- `state-loading` - Loading state container
- `state-invalid` - Invalid link state container
- `state-form` - Registration form state container
- `state-success` - Success state container
- `state-already` - Already registered state container
- `ta-avatar` - TA avatar display
- `ta-name` - TA name display
- `ta-course` - Course name display
- `ta-sir` - Instructor name display
- `success-ta-name` - Success message TA name
- `s-name` - Student name input
- `s-roll` - Student roll number input
- `s-email` - Student email input
- `submit-btn` - Submit button
- `form-alert` - Form alert message
- `submit-spinner` - Submit loading indicator
- `submit-text` - Submit button text
- `already-content` - Already registered content container

### Dashboard Page (dashboard.html)

#### Sidebar
- `sidebar` - Sidebar container
- `sb-avatar` - Sidebar TA avatar
- `sb-name` - Sidebar TA name
- `class-switcher` - Class selection dropdown
- `pending-badge` - Pending students badge
- `queries-badge` - Unresolved queries badge

#### Page Structure
- `page-title` - Current page title
- `page-sub` - Current page subtitle
- `overlay` - Mobile sidebar overlay
- `toast` - Toast notification container
- `toast-icon` - Toast icon
- `toast-msg` - Toast message

#### Overview Section
- `sec-overview` - Overview section container
- `ov-total` - Total students stat
- `ov-approved` - Approved students stat
- `ov-pending` - Pending students stat
- `ov-marks` - Marks entered stat
- `ov-link-box` - Class link preview box
- `ov-recent-students` - Recent students list

#### Class Link Section
- `sec-link` - Class link section container
- `prev-ta-name` - Preview TA name
- `prev-course` - Preview course name
- `prev-sir` - Preview instructor name
- `c-name` - Class name input
- `c-sir-name` - Class instructor input
- `teacher-link-display` - Teacher link display container
- `link-display` - Student link display container

#### Students Section
- `sec-students` - Students section container
- `add-student-card` - Add student form card
- `add-student-name` - Manual add student name input
- `add-student-roll` - Manual add student roll input
- `add-student-email` - Manual add student email input
- `student-search` - Student search input
- `students-count` - Student count display
- `students-tbody` - Students table body
- `f-all` - Filter all button
- `f-pending` - Filter pending button
- `f-approved` - Filter approved button
- `f-rejected` - Filter rejected button

#### Marks Section
- `sec-marks` - Marks section container
- `new-col-subject` - New column name input
- `new-col-total` - New column total input
- `gradebook-search` - Gradebook search input
- `marks-visibility-btn` - Marks visibility toggle button
- `marks-side-list` - Marks column pills container
- `marks-table` - Gradebook table
- `marks-thead` - Gradebook table header
- `marks-tbody` - Gradebook table body
- `sheet-status-text` - Google Sheets status text
- `sheet-link-wrap` - Google Sheets link wrapper
- `sheet-link` - Google Sheets link

#### Queries Section
- `sec-queries` - Queries section container
- `queries-count` - Queries count display
- `queries-list` - Queries list container

#### Profile Section
- `sec-profile` - Profile section container
- `profile-avatar` - Profile avatar display
- `profile-name-display` - Profile name display
- `profile-email-display` - Profile email display
- `avatar-file-input` - Avatar file input (hidden)
- `p-ta-name` - Profile TA name input
- `p-email` - Profile email input (readonly)

### Teacher View Page (teacher-view.html)
- `loading` - Loading state
- `error-state` - Error state
- `content` - Main content container
- `class-name` - Class name display
- `ta-name` - TA name display
- `total-students` - Total students stat
- `graded-students` - Graded students stat
- `class-average` - Class average stat
- `jump-wrap` - Quiz navigation pills
- `quiz-sections` - Quiz sections container

---

## CSS CLASSES (BEHAVIOR-CRITICAL - DO NOT RENAME)

### State Classes
- `.active` - Active tab/section/pill
- `.show` - Visible toast/overlay
- `.open` - Open sidebar (mobile)
- `.visible` - Revealed animation element
- `.active-pill` - Active marks column pill
- `.col-highlight` - Highlighted gradebook column

### Status Badge Classes
- `.badge-pending` - Pending student badge
- `.badge-approved` - Approved student badge
- `.badge-rejected` - Rejected student badge

### Component Classes
- `.state` - Page state container (join.html)
- `.panel` - Auth panel (login.html)
- `.section` - Dashboard section container
- `.alert` - Alert message box
- `.alert.error` - Error alert
- `.alert.success` - Success alert
- `.spinner` - Loading spinner
- `.nav-item` - Sidebar navigation item
- `.nav-badge` - Sidebar notification badge
- `.stat-card` - Stat card container
- `.card` - Generic card container
- `.btn` - Button base class
- `.btn-primary` - Primary button
- `.btn-secondary` - Secondary button
- `.btn-success` - Success button
- `.btn-danger` - Danger button
- `.btn-ghost` - Ghost button
- `.btn-sm` - Small button
- `.form-input` - Form input field
- `.marks-input` - Gradebook marks input
- `.empty-state` - Empty state container

---

## JAVASCRIPT GLOBAL VARIABLES (DO NOT RENAME)

### Configuration
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON` - Supabase anon key
- `sb` - Supabase client instance

### State Variables (dashboard.html)
- `currentTA` - Current TA profile object
- `currentClass` - Currently selected class object
- `allClasses` - Array of all TA's classes
- `allStudents` - Array of current class students
- `currentFilter` - Current student filter ('all'|'pending'|'approved'|'rejected')
- `marksColumns` - Array of mark categories
- `marksLookup` - Object mapping category_id → student_id → marks data
- `realtimeDebounce` - Realtime sync debounce timer
- `refreshRetries` - Realtime sync retry counter

### State Variables (join.html)
- `token` - Class link token from URL
- `taData` - TA and class information
- `currentRollNo` - Currently viewing student's roll number

---

## JAVASCRIPT FUNCTION NAMES (EXTERNALLY REFERENCED - DO NOT RENAME)

### Global Functions (Called from HTML onclick/oninput attributes)

#### dashboard.html
- `openSidebar()` - Open mobile sidebar
- `closeSidebar()` - Close mobile sidebar
- `showSection(id)` - Navigate to dashboard section
- `switchClass(classId)` - Change current class
- `addNewClass()` - Create new class
- `saveClassDetails()` - Save class name and instructor
- `generateLink()` - Generate student invite link
- `generateTeacherLink()` - Generate instructor view link
- `copyLink(url)` - Copy link to clipboard
- `toggleAddStudentForm()` - Show/hide manual add student form
- `addStudentManually()` - Add student without link
- `filterStudents(status)` - Filter students by status
- `approveStudent(id)` - Approve pending student
- `rejectStudent(id)` - Reject pending student
- `deleteStudent(id)` - Delete student record
- `addMarksColumn()` - Add new marks category
- `renderGradebook()` - Render gradebook table
- `saveAllMarks()` - Sync marks to Google Sheets
- `toggleMarksVisibility()` - Toggle student marks visibility
- `loadQueries()` - Load student queries
- `toggleReplyForm(queryId)` - Show/hide query reply form
- `sendQueryReply(queryId)` - Send reply to student query
- `toggleQueryResolved(queryId, resolved)` - Mark query as resolved/unresolved
- `saveProfile()` - Save TA profile changes
- `uploadAvatar(input)` - Upload profile picture
- `handleLogout()` - Logout current user

#### login.html
- `switchTab(tab)` - Switch between login/signup tabs
- `showForgotPanel()` - Show forgot password panel
- `hideForgotPanel()` - Hide forgot password panel
- `handleLogin()` - Process login
- `handleSignup()` - Process signup
- `handleForgotPassword()` - Send password reset email
- `togglePw(id, btn)` - Toggle password visibility
- `checkStrength(val)` - Check password strength

#### reset-password.html
- `togglePw(id, btn)` - Toggle password visibility
- `handleReset()` - Process password reset

#### join.html
- `handleSubmit()` - Submit student registration
- `checkStatus(roll_no)` - Check student status and marks
- `toggleQueryForm(categoryId)` - Show/hide query submission form
- `submitQuery(categoryId, studentId)` - Submit query about marks

#### teacher-view.html
- `showQuiz(id)` - Navigate to quiz section
- `toggleFullList(id)` - Expand/collapse full student list

---

## URL QUERY PARAMETERS (DO NOT RENAME)

### join.html
- `?ta=<CLASS_LINK_TOKEN>` - **CRITICAL**: Links to classes.class_link_token

### teacher-view.html
- `?token=<TEACHER_VIEW_TOKEN>` - **CRITICAL**: Links to classes.teacher_view_token

### reset-password.html
- `?code=<RESET_CODE>` - **CRITICAL**: Supabase password reset PKCE code

---

## LOCAL STORAGE KEYS (DO NOT RENAME)

### dashboard.html
- `ta_current_class` - Stores currently selected class UUID

---

## SUPABASE REALTIME CHANNEL NAMES (DO NOT RENAME)

### dashboard.html
- `ta-portal-sync` - Main realtime sync channel for students, marks, categories, classes, queries

---

## STATUS ENUM VALUES (DO NOT CHANGE)

### students.status
- `'pending'` - Student awaiting approval
- `'approved'` - Student accepted into class
- `'rejected'` - Student denied enrollment

---

## MAGIC STRINGS (DO NOT CHANGE)

### File Upload Paths
- Avatar path pattern: `{ta_id}/avatar.{ext}`
- Query photo pattern: `{category_id}/{student_id}-{timestamp}-{index}.{ext}`

### Email Templates (send-marks-email)
- From address: `TA Portal <noreply@your-domain.com>`
- Subject patterns:
  - Marks: `📊 Your {category} Marks — {course}`
  - Reminder: `⚠️ Missing Marks: {category} — {course}`

### HTTP Headers
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Headers: authorization, x-client-info, apikey, content-type`
- `Content-Type: application/json`

---

## CONCLUSION

This document catalogs every identifier that forms a **contract** between:
- Frontend ↔ Backend
- Database ↔ Application
- User ↔ System
- JavaScript ↔ DOM

**Renaming any of these identifiers requires coordinated changes across multiple files and potentially data migrations.**

Before modifying:
1. Search entire codebase for all occurrences
2. Identify all dependent systems
3. Plan migration strategy
4. Test thoroughly in development
5. Create database backups

**Visual-only changes (colors, fonts, layout) are safe.** 
**Identifier changes are NOT safe unless you understand the full dependency chain.**

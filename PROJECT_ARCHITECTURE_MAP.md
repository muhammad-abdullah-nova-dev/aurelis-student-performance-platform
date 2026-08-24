# PROJECT ARCHITECTURE MAP

## PROJECT PURPOSE

**TA Portal** is a Teaching Assistant Management System designed to streamline the workflow of teaching assistants managing student rosters, marks/grades, and communication. The system allows TAs to:

- Create classes and generate unique invitation links for students
- Approve/reject student enrollment requests
- Maintain gradebooks with multiple mark categories (quizzes, assignments, etc.)
- Sync marks automatically to Google Sheets
- Provide read-only teacher dashboards for course instructors
- Enable students to view their marks and submit queries
- Manage student queries with photo uploads

---

## FRONTEND ARCHITECTURE

### Technology Stack
- **Pure HTML/CSS/JavaScript** (no framework dependencies)
- **Supabase JS Client** (v2) via CDN
- **Google Fonts**: Plus Jakarta Sans (body), Fraunces (headings), Caveat (handwriting)
- **Responsive Design**: Mobile-first with breakpoints at 480px, 500px, 600px, 640px, 900px

### Core Files
- `index.html` - Landing page
- `login.html` - Authentication (login/signup)
- `reset-password.html` - Password reset handler
- `dashboard.html` - Main TA interface (authenticated)
- `join.html` - Student registration page
- `teacher-view.html` - Read-only instructor dashboard

### Page Responsibilities Summary

| Page | Auth Required | Purpose | Key Features |
|------|---------------|---------|--------------|
| index.html | No | Marketing | Hero, features, CTA |
| login.html | No | Auth gateway | Login, signup, password reset |
| reset-password.html | No | Password reset | Handle email reset links |
| dashboard.html | Yes | TA control panel | Classes, students, marks, queries |
| join.html | No | Student registration | Register, view marks, submit queries |
| teacher-view.html | Token-based | Instructor view | Class progress, statistics |

---

## BACKEND ARCHITECTURE (SUPABASE)

### Database Tables

**ta_profiles** - TA identity
- Core fields: id, ta_name, email, avatar_url
- Deprecated: sir_name, course, class_link_token, google_sheet_url

**classes** - Individual classes/courses
- Fields: id, ta_id, name, sir_name, class_link_token, teacher_view_token, google_sheet_url, marks_visible

**students** - Enrolled students
- Fields: id, ta_id, class_id, name, roll_no, email, status
- Status values: 'pending', 'approved', 'rejected'

**mark_categories** - Grade columns (Quiz 1, Assignment 2, etc.)
- Fields: id, ta_id, class_id, name, total

**marks** - Individual student marks
- Fields: id, student_id, ta_id, category_id, marks, remarks

**mark_queries** - Student questions about marks
- Fields: id, student_id, ta_id, category_id, message, photo_urls, resolved, reply, replied_at

### Edge Functions

1. **check-roll-taken** - Verify roll number availability
2. **cleanup-failed-signup** - Recovery mechanism for failed signups
3. **create-ta-profile** - Create TA profile + first class
4. **get-student-marks** - Secure student marks retrieval
5. **get-ta-by-token** - Validate class token and return TA info
6. **get-teacher-dashboard** - Generate instructor progress view
7. **send-marks-email** - Email notifications via Resend API

---

## AUTHENTICATION ARCHITECTURE

### Flow: Signup
1. User fills form → `sb.auth.signUp()`
2. Edge Function `create-ta-profile` creates profile + first class
3. If fails → `cleanup-failed-signup` removes auth user
4. Redirect to dashboard

### Flow: Login
1. User enters credentials → `sb.auth.signInWithPassword()`
2. Session stored → redirect to dashboard

### Flow: Password Reset
1. Request link → `sb.auth.resetPasswordForEmail()`
2. Email with `?code=<TOKEN>` → reset-password.html
3. Exchange code → `sb.auth.exchangeCodeForSession()`
4. Update password → `sb.auth.updateUser()`

---

## KEY DATA FLOWS

### Student Enrollment
```
TA generates link → Student opens join.html?ta=<TOKEN>
→ Validates token (get-ta-by-token)
→ Student submits form → check-roll-taken
→ INSERT students (status='pending')
→ TA approves → UPDATE status='approved'
```

### Marks Entry & Viewing
```
TA creates category → INSERT mark_categories
→ TA enters marks → UPSERT marks (auto-save)
→ TA syncs → Google Sheets API push
→ Student views → get-student-marks (if marks_visible=true)
```

### Query Management
```
Student submits query + photos → Upload to storage
→ INSERT mark_queries → TA sees in dashboard
→ TA replies → UPDATE reply, resolved=true
→ Student sees reply on refresh
```

---

## STYLING ARCHITECTURE

### Design System (CSS Variables)
```css
--bg:      #FBF5EA  /* Warm paper beige */
--card:    #FFFDF8  /* Off-white cards */
--accent:  #C63D2F  /* Primary red */
--accent2: #3E7A54  /* Success green */
--text:    #2B2420  /* Dark brown text */
--muted:   #6B5F53  /* Muted text */
```

### Typography
- **Body**: Plus Jakarta Sans (400, 500, 600, 700)
- **Headings**: Fraunces (600, 700, 800)
- **Handwriting**: Caveat (600, 700)

### Component Patterns
- **Cards**: Rounded corners (14px), subtle borders, shadow on hover
- **Buttons**: Box-shadow "press" effect, transform on hover
- **Forms**: Focused accent border + glow ring
- **Tables**: Sticky headers, alternating row hover

---

## JAVASCRIPT ARCHITECTURE

### Global State Management (dashboard.html)
```javascript
let currentTA = null;        // ta_profiles row
let currentClass = null;     // selected class
let allClasses = [];         // all TA's classes
let allStudents = [];        // current class students
let marksColumns = [];       // mark categories
let marksLookup = {};        // marks by category and student
```

### Key Functions
- **Session Management**: getSession(), loadTA(), handleLogout()
- **Class Management**: loadClasses(), switchClass(), addNewClass()
- **Student Management**: loadStudents(), filterStudents(), approveStudent()
- **Marks Management**: loadMarksData(), renderGradebook(), saveAllMarks()
- **Realtime Sync**: setupRealtimeSync() - auto-refresh on data changes

### Realtime Updates
Uses Supabase Realtime to subscribe to postgres_changes on:
- students table (ta_id filter)
- marks table (ta_id filter)
- mark_categories table (ta_id filter)
- classes table (ta_id filter)
- mark_queries table (ta_id filter)

Debounced refresh prevents UI disruption during active typing.

---

## RESPONSIVE BEHAVIOR

### Mobile Adaptations
- **Sidebar**: Fixed → toggleable overlay with burger menu
- **Stats**: 4 columns → 2 columns → 1 column
- **Forms**: Multi-column → single column
- **Gradebook**: Name + Roll No frozen (sticky-left), horizontal scroll for marks
- **Navigation**: Full menu → hidden → burger menu

### Touch Optimization
- Button minimum size: 44x44px
- Increased padding on mobile
- Larger tap targets for dropdowns and toggles

---

## SECURITY CONSIDERATIONS

### Row Level Security (RLS)
- **Note**: Schema does not show RLS policies
- **Current**: Edge Functions use service role key (full access)
- **Anon client**: Limited to auth operations and Edge Function calls

### Token-Based Access
- **class_link_token**: Public student enrollment (in URL)
- **teacher_view_token**: Read-only instructor access (in URL)
- **Tokens**: 16-byte random hex strings

### Data Isolation
- Students can only see their own marks (via Edge Function)
- TAs can only see their own classes/students
- Instructor view shows aggregated stats only (no direct student PII exposure)

---

## EXTERNAL INTEGRATIONS

### Google Sheets Sync
- **Purpose**: Export marks to Google Sheets for instructor records
- **Implementation**: Not visible in frontend code (backend API call)
- **Storage**: `google_sheet_url` in classes table

### Resend Email API
- **Purpose**: Send marks notifications and reminders
- **Edge Function**: send-marks-email
- **Templates**: HTML emails with grades and remarks
- **Env Variable**: RESEND_API_KEY

### Supabase Storage
- **Bucket**: `mark-query-photos` - Student query attachments
- **Bucket**: `avatars` - TA profile pictures
- **Access**: Public URLs with cache-busting timestamps

---

## DEPLOYMENT CONFIGURATION

### Supabase Project
- **URL**: https://loxxobhsyhqaslpqqrqe.supabase.co
- **Anon Key**: Embedded in HTML files (public, safe to expose)
- **Service Role Key**: Edge Functions only (environment variable)

### Edge Runtime
- **Deno Version**: 2
- **Policy**: per_worker (hot reload enabled)
- **Inspector Port**: 8083

### Database
- **PostgreSQL Version**: 17
- **Port**: 54322 (local development)
- **Extensions**: pgcrypto (for random token generation)

---

## OWNER/CONTACT INFORMATION

### Developer Contact (Embedded in Multiple Files)
- **Email**: farhanfarooqw@gmail.com
- **WhatsApp**: +92 314 9264891

### Locations in Code
- login.html: Footer
- dashboard.html: Sidebar bottom
- index.html: Footer

### Brand Name
- **Primary**: TA Portal
- **Display**: TA<span style="color:red">Portal</span>
- **Logo Pattern**: "TA" in default color + "Portal" in accent red

---

## FILE STRUCTURE

```
ta-portal-main/
├── index.html                 # Landing page
├── login.html                 # Auth page
├── reset-password.html        # Password reset
├── dashboard.html             # Main TA interface
├── join.html                  # Student registration
├── teacher-view.html          # Instructor read-only view
├── .gitignore                 # Git exclusions
├── supabase/
│   ├── config.toml            # Supabase CLI config
│   ├── functions/
│   │   ├── check-roll-taken/
│   │   │   └── index.ts
│   │   ├── cleanup-failed-signup/
│   │   │   └── index.ts
│   │   ├── create-ta-profile/
│   │   │   ├── deno.json
│   │   │   └── index.ts
│   │   ├── get-student-marks/
│   │   │   ├── deno.json
│   │   │   └── index.ts
│   │   ├── get-ta-by-token/
│   │   │   ├── deno.json
│   │   │   └── index.ts
│   │   ├── get-teacher-dashboard/
│   │   │   ├── deno.json
│   │   │   └── index.ts
│   │   └── send-marks-email/
│   │       ├── deno.json
│   │       ├── .npmrc
│   │       └── index.ts
│   └── schemas/
│       └── schema.sql         # Database schema
└── .vscode/
    ├── extensions.json
    └── settings.json
```

---

## CRITICAL OBSERVATIONS

### Multi-Class Architecture
- **Recent Change**: System migrated from single class per TA to multi-class
- **Evidence**: class_switcher dropdown, currentClass state, classes table
- **Migration Path**: Old fields (course, sir_name, etc.) moved from ta_profiles to classes

### Deprecated Fields
- ta_profiles.sir_name → classes.sir_name
- ta_profiles.course → classes.name
- ta_profiles.class_link_token → classes.class_link_token
- ta_profiles.google_sheet_url → classes.google_sheet_url

### Possible Bug
- **get-ta-by-token Edge Function**: Code appears to be copy-paste of get-student-marks
- **Expected**: Should validate class_link_token and return TA/class info
- **Actual**: Attempts to retrieve student marks (incorrect)

### Schema Inconsistency
- students table has UNIQUE constraint on (ta_id, roll_no)
- Should probably be (class_id, roll_no) for multi-class support
- Current constraint would prevent same roll number across different classes by same TA

---

## TECHNOLOGY DECISIONS

### Why No Framework?
- Simplicity and zero build step
- Direct deployment (no compilation)
- Small codebase footprint
- Full control over DOM and state

### Why Supabase?
- Built-in auth
- Real-time subscriptions
- Edge Functions for server logic
- PostgreSQL with full SQL support
- File storage included

### Why Inline Styles?
- Single-file components
- No external CSS files
- Easier to understand and modify per-page
- Reduced HTTP requests

---

## PERFORMANCE CHARACTERISTICS

### Load Times
- All pages are single HTML files
- External dependencies: Supabase JS (CDN), Google Fonts
- No bundling or minification
- Estimated first paint: <1s on 3G

### Database Queries
- Most operations are single-table queries
- Marks viewing requires multiple queries (per-category stats)
- Realtime subscriptions use minimal bandwidth

### Storage Usage
- Query photos: Uncompressed, user-uploaded
- Avatars: Single image per TA (<3MB enforced)
- No automatic optimization

---

## ACCESSIBILITY NOTES

### Current State
- Semantic HTML structure (nav, section, main, aside)
- Form labels associated with inputs
- Keyboard navigation supported (Tab, Enter)
- Focus states visible (accent-colored ring)

### Missing
- ARIA labels on icon buttons
- Skip navigation links
- Screen reader announcements for dynamic content
- Contrast ratio validation (not documented)
- Alt text for decorative SVGs

---

## BROWSER COMPATIBILITY

### Target Browsers
- Modern evergreen browsers (Chrome, Firefox, Safari, Edge)
- CSS Grid and Flexbox required
- CSS Custom Properties required
- ES6+ JavaScript (async/await, arrow functions, destructuring)

### Not Supported
- Internet Explorer (any version)
- Opera Mini
- Browsers without ES6 module support

---

## FUTURE SCALABILITY

### Current Limits
- No pagination on student lists
- No pagination on marks columns
- All data loaded at once (not lazy-loaded)
- Realtime subscriptions scale with connected clients

### Recommended for Growth
- Implement pagination for classes >100 students
- Add virtual scrolling for large gradebooks
- Consider data export/archiving for old classes
- Add analytics for TA usage patterns


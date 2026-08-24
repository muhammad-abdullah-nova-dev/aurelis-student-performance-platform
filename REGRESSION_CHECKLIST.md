# REGRESSION CHECKLIST

## PURPOSE

This checklist ensures all critical workflows remain functional after visual or branding modifications. Use this document to verify that no behavior-critical functionality was broken during the redesign process.

**Rule**: All items must pass before deploying changes to production.

---

## PRE-MODIFICATION BASELINE

### Step 1: Document Current State
Before making any changes, verify the application works:

- [ ] Can access all pages without errors
- [ ] Can login with existing TA account
- [ ] Can view dashboard
- [ ] Can see existing students and marks
- [ ] No console errors on any page

### Step 2: Create Test Account
- [ ] Create a new TA account for testing
- [ ] Record email and password
- [ ] Verify account created successfully

### Step 3: Take Screenshots
- [ ] Homepage (desktop + mobile)
- [ ] Login page
- [ ] Dashboard (all sections)
- [ ] Student enrollment page
- [ ] Teacher view page

**Purpose**: Compare before/after to ensure visual changes applied correctly

---

## AUTHENTICATION WORKFLOWS

### Signup Flow
- [ ] Navigate to index.html
- [ ] Click "Get Started Free" or "Login / Sign Up"
- [ ] Switch to "Sign Up" tab
- [ ] Fill in ALL required fields:
  - [ ] TA Name (e.g., "Test TA")
  - [ ] Sir's Name (e.g., "Test Sir")
  - [ ] Course (e.g., "Test Course 101")
  - [ ] Email (unique email)
  - [ ] Password (min 8 characters)
- [ ] Password strength indicator shows correct levels
- [ ] Click "Create Account →"
- [ ] Account creation succeeds
- [ ] Redirected to dashboard.html
- [ ] First class created automatically with course name
- [ ] No console errors

**Critical Elements**:
- signup-ta-name, signup-sir-name, signup-course, signup-email, signup-password IDs
- strength-wrap, strength-fill, strength-label IDs
- handleSignup() function
- create-ta-profile Edge Function

### Login Flow
- [ ] Navigate to login.html
- [ ] Ensure "Login" tab is active
- [ ] Enter valid email
- [ ] Enter valid password
- [ ] Click "Login to Dashboard"
- [ ] Success message appears
- [ ] Redirected to dashboard.html within 2 seconds
- [ ] TA name appears in sidebar
- [ ] No console errors

**Critical Elements**:
- login-email, login-password IDs
- handleLogin() function
- Supabase auth session creation

### Password Reset Flow
- [ ] Navigate to login.html
- [ ] Click "Forgot password?"
- [ ] Forgot password panel appears
- [ ] Enter email address
- [ ] Click "Send Reset Link →"
- [ ] Success message: "If that email is registered..."
- [ ] Check email inbox for reset link
- [ ] Click reset link in email
- [ ] Redirected to reset-password.html?code=...
- [ ] "Reset Your Password" form appears
- [ ] Enter new password (min 8 characters)
- [ ] Enter same password in "Confirm Password"
- [ ] Click "Update Password →"
- [ ] Success message appears
- [ ] Redirected to dashboard.html
- [ ] Can login with new password

**Critical Elements**:
- forgot-email ID
- new-password, confirm-password IDs
- reset-password.html PKCE code exchange
- handleForgotPassword(), handleReset() functions

### Logout Flow
- [ ] Login to dashboard
- [ ] Scroll to bottom of sidebar
- [ ] Click "Logout" button
- [ ] Redirected to index.html or login.html
- [ ] Session cleared (cannot access dashboard without re-login)
- [ ] No console errors

**Critical Elements**:
- handleLogout() function
- Supabase session destruction

### Session Persistence
- [ ] Login to dashboard
- [ ] Close browser tab
- [ ] Reopen browser
- [ ] Navigate to dashboard.html directly
- [ ] Still logged in (no redirect to login)
- [ ] TA data loads correctly

**Critical Elements**:
- Supabase session storage
- getSession() on page load

---

## CLASS MANAGEMENT WORKFLOWS

### View Default Class
- [ ] Login to dashboard
- [ ] Dashboard overview loads
- [ ] Class name appears in class switcher dropdown
- [ ] Class details appear in "Class Link" section
- [ ] No console errors

**Critical Elements**:
- currentClass variable
- loadClasses() function

### Create New Class
- [ ] Navigate to dashboard
- [ ] Click "➕ New Class" button in sidebar
- [ ] Prompt appears: "New class name"
- [ ] Enter class name (e.g., "Data Structures — Section B")
- [ ] Prompt appears: "Sir's name"
- [ ] Enter instructor name (optional)
- [ ] New class created
- [ ] Class switcher updates with new class
- [ ] Switched to new class automatically
- [ ] Toast notification: "Class '...' created!"

**Critical Elements**:
- addNewClass() function
- classes table INSERT
- generate_class_token() function

### Switch Between Classes
- [ ] Create at least 2 classes
- [ ] Click class switcher dropdown
- [ ] Select different class
- [ ] Dashboard updates to show selected class students/marks
- [ ] Toast: "Switched to '...'"
- [ ] Page sections refresh with new class data

**Critical Elements**:
- class-switcher ID
- switchClass() function
- Local storage: ta_current_class

### Edit Class Details
- [ ] Navigate to "Class Link" section
- [ ] Edit "Class / Course Name" input
- [ ] Edit "Sir's Name" input
- [ ] Click "💾 Save Class Details"
- [ ] Toast: "Class details updated!"
- [ ] Class switcher shows updated name
- [ ] Preview card shows updated info

**Critical Elements**:
- c-name, c-sir-name IDs
- saveClassDetails() function
- classes table UPDATE

---

## STUDENT ENROLLMENT WORKFLOWS

### Generate Class Link
- [ ] Navigate to "Class Link" section
- [ ] Click "⚡ Generate New Link" button
- [ ] New link appears in link box
- [ ] Link format: `join.html?ta=<TOKEN>`
- [ ] Token is 32-character hex string
- [ ] Preview card shows correct TA name, course, sir name

**Critical Elements**:
- generateLink() function
- classes.class_link_token
- generate_class_token() function

### Copy Class Link
- [ ] Generate class link
- [ ] Click "📋 Copy" button
- [ ] Toast or native confirmation appears
- [ ] Paste link in text editor - verify it pastes correctly

**Critical Elements**:
- copyLink() function
- Clipboard API

### Student Registration (Valid)
- [ ] Copy class link
- [ ] Open link in new incognito/private window
- [ ] TA info card displays:
  - [ ] TA avatar (initials or photo)
  - [ ] TA name
  - [ ] Course name
  - [ ] Sir's name
- [ ] Fill student form:
  - [ ] Name: "Test Student"
  - [ ] Roll No: "25F-1234"
  - [ ] Email: "student@test.com"
- [ ] Click "Request to Join →"
- [ ] Success screen appears
- [ ] Message: "Request Submitted!"
- [ ] Instructions to save link and roll number

**Critical Elements**:
- join.html?ta=<TOKEN>
- get-ta-by-token Edge Function
- s-name, s-roll, s-email IDs
- handleSubmit() function
- check-roll-taken Edge Function
- students table INSERT

### Student Registration (Duplicate Roll Number)
- [ ] Register a student with roll number "25F-9999"
- [ ] Try to register another student with same roll number
- [ ] "Already Registered" state appears
- [ ] Shows pending/approved/rejected status
- [ ] Does NOT create duplicate record

**Critical Elements**:
- check-roll-taken Edge Function
- UNIQUE constraint on (class_id, roll_no)

### Student Registration (Invalid Link)
- [ ] Open `join.html?ta=invalidtoken123`
- [ ] "Invalid Link" state appears
- [ ] Message: "This class link is invalid or has expired"
- [ ] No form shown

**Critical Elements**:
- get-ta-by-token Edge Function
- Error handling

### Approve Pending Student
- [ ] Login as TA
- [ ] Navigate to "Students" section
- [ ] Click "Pending" filter button
- [ ] Pending students appear with yellow badge
- [ ] Click "✓ Approve" button for a student
- [ ] Student moves to "Approved" list
- [ ] Badge changes to green
- [ ] Pending badge count decreases

**Critical Elements**:
- f-pending button
- approveStudent() function
- students.status UPDATE to 'approved'

### Reject Student
- [ ] Click "Reject" button for a pending student
- [ ] Student moves to "Rejected" list
- [ ] Badge changes to red
- [ ] Student cannot view marks

**Critical Elements**:
- rejectStudent() function
- students.status UPDATE to 'rejected'

### Delete Student
- [ ] Click delete/trash button for any student
- [ ] Confirmation prompt (if implemented)
- [ ] Student removed from list
- [ ] Record deleted from database

**Critical Elements**:
- deleteStudent() function
- students table DELETE (cascade to marks)

### Add Student Manually
- [ ] Navigate to "Students" section
- [ ] Click "➕ Add Student" button
- [ ] Form appears
- [ ] Fill: Name, Roll No, Email (optional)
- [ ] Click "Add Student"
- [ ] Student appears in "Approved" list immediately
- [ ] Status is 'approved' (not pending)

**Critical Elements**:
- add-student-card
- add-student-name, add-student-roll, add-student-email IDs
- addStudentManually() function

### Filter Students
- [ ] Have students with different statuses (pending, approved, rejected)
- [ ] Click "All" button - all students shown
- [ ] Click "Pending" button - only pending shown
- [ ] Click "Approved" button - only approved shown
- [ ] Click "Rejected" button - only rejected shown
- [ ] Active filter button highlighted

**Critical Elements**:
- f-all, f-pending, f-approved, f-rejected IDs
- filterStudents() function

### Search Students
- [ ] Have multiple students
- [ ] Type student name in search box
- [ ] Results filter in real-time
- [ ] Type roll number - filters by roll number
- [ ] Clear search - all students return

**Critical Elements**:
- student-search ID
- filterStudents() with search logic

---

## MARKS/GRADEBOOK WORKFLOWS

### Add Marks Column
- [ ] Navigate to "Marks" section
- [ ] Enter column name: "Quiz 1"
- [ ] Enter total marks: "20"
- [ ] Click "Add Column"
- [ ] New column appears in gradebook header
- [ ] All students have empty cells for new column

**Critical Elements**:
- new-col-subject, new-col-total IDs
- addMarksColumn() function
- mark_categories table INSERT

### Enter Marks
- [ ] Click in marks input cell
- [ ] Type number (e.g., "18")
- [ ] Click outside or press Tab
- [ ] Marks auto-save after debounce
- [ ] No explicit save button needed
- [ ] Value persists on page refresh

**Critical Elements**:
- marks-tbody inputs
- Debounced save logic
- marks table UPSERT

### Edit Marks
- [ ] Enter marks for a student
- [ ] Change marks to different value
- [ ] New value auto-saves
- [ ] Correct value shown on refresh

**Critical Elements**:
- marks table UPDATE

### Delete Marks Column
(if implemented)
- [ ] Delete a marks category
- [ ] Column removed from gradebook
- [ ] All marks for that category deleted (cascade)

**Critical Elements**:
- mark_categories DELETE cascade

### Toggle Marks Visibility
- [ ] Navigate to "Marks" section
- [ ] Check current state (visible/hidden)
- [ ] Click marks visibility toggle button
- [ ] Button text changes
- [ ] Toast notification confirms change
- [ ] Open student join link
- [ ] Enter approved student roll number
- [ ] If visible: marks shown
- [ ] If hidden: "marks not published" message

**Critical Elements**:
- marks-visibility-btn ID
- toggleMarksVisibility() function
- classes.marks_visible column

### Sync to Google Sheets
- [ ] Enter marks for multiple students
- [ ] Click "Sync to Google Sheets" button
- [ ] Loading indicator appears
- [ ] Toast: "Synced successfully" (or similar)
- [ ] Google Sheet URL stored/updated
- [ ] Link to sheet appears below gradebook

**Critical Elements**:
- saveAllMarks() function
- Google Sheets API integration
- classes.google_sheet_url

### Gradebook Mobile Behavior
- [ ] Resize browser to mobile width (<900px)
- [ ] Name and Roll No columns stay fixed (sticky left)
- [ ] Marks columns scroll horizontally
- [ ] Can enter marks on mobile
- [ ] No columns overlap

**Critical Elements**:
- Responsive CSS sticky positioning
- #marks-table mobile styles

### Search in Gradebook
- [ ] Have multiple students with marks
- [ ] Type student name in gradebook search
- [ ] Only matching rows shown
- [ ] Type roll number - filters by roll
- [ ] Clear search - all rows return

**Critical Elements**:
- gradebook-search ID
- renderGradebook() filter logic

---

## STUDENT MARKS VIEWING WORKFLOWS

### Check Status (Pending)
- [ ] Register as student (don't approve)
- [ ] Return to join link
- [ ] Enter same roll number
- [ ] Status: "Still Waiting for Approval"
- [ ] No marks shown

**Critical Elements**:
- get-student-marks Edge Function
- status='pending' handling

### Check Status (Rejected)
- [ ] Reject student registration
- [ ] Student checks status via join link
- [ ] Status: "Request Not Approved"
- [ ] No marks shown

**Critical Elements**:
- status='rejected' handling

### View Marks (Published)
- [ ] Approve student
- [ ] Enter marks for student
- [ ] Toggle marks visibility ON
- [ ] Student opens join link
- [ ] Enters roll number
- [ ] Marks displayed with comparisons:
  - [ ] Student's score
  - [ ] Highest in class
  - [ ] Average in class
  - [ ] Lowest in class
- [ ] Bar chart visualization shows

**Critical Elements**:
- classes.marks_visible=true
- get-student-marks Edge Function
- Marks comparison calculations

### View Marks (Hidden)
- [ ] Toggle marks visibility OFF
- [ ] Student checks marks
- [ ] Message: "Your TA hasn't published marks yet"
- [ ] No marks data shown

**Critical Elements**:
- classes.marks_visible=false
- Conditional rendering

---

## QUERY/COMMUNICATION WORKFLOWS

### Submit Query (Student Side)
- [ ] Student views their marks
- [ ] Clicks "Ask a question about this" on a marks category
- [ ] Query form appears
- [ ] Enter message: "Please review my Quiz 1 marks"
- [ ] (Optional) Upload 1-2 photos
- [ ] Click "Send"
- [ ] Query submits successfully
- [ ] Shows "Waiting for TA's reply"

**Critical Elements**:
- toggleQueryForm() function
- submitQuery() function
- mark_queries table INSERT
- mark-query-photos storage bucket

### View Queries (TA Side)
- [ ] Login as TA
- [ ] Navigate to "Queries" section
- [ ] Submitted queries appear
- [ ] Shows student name, roll number, category
- [ ] Shows query message
- [ ] Shows attached photos (if any)
- [ ] Shows timestamp

**Critical Elements**:
- sec-queries section
- loadQueries() function
- mark_queries table SELECT

### Reply to Query
- [ ] Click "💬 Reply to Student" on a query
- [ ] Reply form appears
- [ ] Enter reply message
- [ ] Click "Send Reply"
- [ ] Reply saved
- [ ] Query marked as resolved
- [ ] Student sees reply when checking marks

**Critical Elements**:
- toggleReplyForm() function
- sendQueryReply() function
- mark_queries.reply, mark_queries.replied_at UPDATE

### Edit Reply
- [ ] Query with existing reply
- [ ] Click "✏️ Edit Reply"
- [ ] Form pre-filled with current reply
- [ ] Change text
- [ ] Click "Send Reply"
- [ ] Reply updated

**Critical Elements**:
- Reply editing logic
- mark_queries UPDATE

### Mark Query Resolved/Unresolved
- [ ] Click "✓ Mark Resolved" on query
- [ ] Query marked as resolved
- [ ] Opacity/style changes to indicate resolved
- [ ] Click "↺ Reopen"
- [ ] Query marked as unresolved

**Critical Elements**:
- toggleQueryResolved() function
- mark_queries.resolved UPDATE

### Query with Photos
- [ ] Student uploads photos with query
- [ ] TA sees photo thumbnails in query
- [ ] Click photo - opens in new tab
- [ ] Photos accessible via public URL

**Critical Elements**:
- Supabase Storage upload
- mark-query-photos bucket
- Public URL generation

---

## TEACHER VIEW WORKFLOWS

### Generate Teacher View Link
- [ ] Navigate to "Class Link" section
- [ ] Click "⚡ Generate Teacher Link"
- [ ] Teacher view token generated
- [ ] Link appears: `teacher-view.html?token=<TOKEN>`
- [ ] Token is 32-character hex string

**Critical Elements**:
- generateTeacherLink() function
- classes.teacher_view_token
- generate_class_token() function

### View Teacher Dashboard
- [ ] Copy teacher view link
- [ ] Open in new incognito window (no login)
- [ ] Class progress dashboard loads
- [ ] Shows:
  - [ ] Class name
  - [ ] TA name
  - [ ] Sir name
  - [ ] Total students
  - [ ] Graded students
  - [ ] Overall class average
- [ ] Per-quiz sections show:
  - [ ] Quiz name and total
  - [ ] Average, highest, lowest
  - [ ] Distribution bar
  - [ ] Top 5 performers
  - [ ] Bottom 5 performers
- [ ] Can expand "View all X students"
- [ ] No edit controls visible

**Critical Elements**:
- teacher-view.html?token=<TOKEN>
- get-teacher-dashboard Edge Function
- Read-only display (no forms)

### Navigate Between Quizzes
- [ ] Have multiple marks categories
- [ ] Teacher view shows pill buttons for each quiz
- [ ] Click quiz button
- [ ] Scrolls to that quiz section
- [ ] Active pill highlighted

**Critical Elements**:
- showQuiz() function
- Jump navigation pills

### Expand/Collapse Student Lists
- [ ] Click "View all X students"
- [ ] Full list expands
- [ ] Shows all students with marks
- [ ] Click again - list collapses

**Critical Elements**:
- toggleFullList() function

---

## PROFILE MANAGEMENT WORKFLOWS

### View Profile
- [ ] Navigate to "My Profile" section
- [ ] TA name displayed
- [ ] Email displayed (read-only)
- [ ] Avatar shows initials or uploaded photo

**Critical Elements**:
- sec-profile section
- p-ta-name, p-email IDs
- profile-avatar ID

### Edit Profile Name
- [ ] Change TA name input
- [ ] Click "💾 Save Changes"
- [ ] Toast: success message
- [ ] Sidebar name updates
- [ ] Name persists on refresh

**Critical Elements**:
- saveProfile() function
- ta_profiles.ta_name UPDATE

### Upload Avatar
- [ ] Click "📷 Upload Photo"
- [ ] File picker opens
- [ ] Select image file (<3MB)
- [ ] Upload processes
- [ ] Toast: "Profile photo updated!"
- [ ] Avatar updates in sidebar and profile
- [ ] Photo persists on refresh

**Critical Elements**:
- avatar-file-input ID
- uploadAvatar() function
- avatars storage bucket
- ta_profiles.avatar_url UPDATE

### Avatar Fallback (No Photo)
- [ ] Create new account (no avatar uploaded)
- [ ] Avatar shows TA initials
- [ ] Initials are first letters of first two words
- [ ] Background: gradient (accent → accent2)

**Critical Elements**:
- renderAvatar() function
- Initials calculation

---

## REALTIME SYNC WORKFLOWS

### Multi-Device Sync (Students)
- [ ] Login on Device A
- [ ] Open same class on Device B (different browser/device)
- [ ] Approve a student on Device A
- [ ] Within ~1 second, student appears on Device B
- [ ] No manual refresh needed

**Critical Elements**:
- setupRealtimeSync() function
- Supabase Realtime channel: 'ta-portal-sync'
- students table subscription

### Multi-Device Sync (Marks)
- [ ] Open gradebook on Device A
- [ ] Open same class on Device B
- [ ] Enter marks on Device A
- [ ] Within ~1 second, marks appear on Device B
- [ ] No manual refresh needed

**Critical Elements**:
- marks table subscription
- Debounced refresh to avoid interrupting typing

### Sync During Active Editing
- [ ] Start typing marks in a cell
- [ ] Another device makes a change
- [ ] Current device does NOT refresh while typing
- [ ] After finishing typing (~3 seconds idle), refresh occurs
- [ ] Recent changes from other device appear

**Critical Elements**:
- refreshRetries counter
- Active element detection

---

## EMAIL WORKFLOWS

### Send Marks Email (If Implemented)
- [ ] Enter student marks
- [ ] Click send email button (if exists)
- [ ] Email sent to student email
- [ ] Email contains:
  - [ ] Student name
  - [ ] Category name
  - [ ] Marks and total
  - [ ] Percentage
  - [ ] Grade letter
  - [ ] Remarks (if any)
- [ ] Email header: "TA Portal 🎓"
- [ ] Email footer: branding and "Do not reply"

**Critical Elements**:
- send-marks-email Edge Function
- Resend API integration
- Email template rendering

### Send Missing Marks Reminder
- [ ] Trigger reminder email (if implemented)
- [ ] Email sent with warning icon
- [ ] Subject: "⚠️ Missing Marks: ..."
- [ ] Email indicates marks not entered
- [ ] Includes course and category info

**Critical Elements**:
- send-marks-email with is_reminder=true
- Reminder email template

---

## RESPONSIVE/MOBILE WORKFLOWS

### Mobile Navigation (Dashboard)
- [ ] Resize browser to <900px wide
- [ ] Burger menu (☰) appears in top-right
- [ ] Click burger menu
- [ ] Sidebar slides in from left
- [ ] Overlay darkens background
- [ ] Click overlay - sidebar closes
- [ ] Navigation works on mobile

**Critical Elements**:
- openSidebar(), closeSidebar() functions
- .sidebar.open class
- .overlay.show class

### Mobile Forms
- [ ] Resize to mobile width
- [ ] All forms readable and usable
- [ ] Inputs stack vertically
- [ ] Buttons full-width or centered
- [ ] No horizontal scroll
- [ ] Touch targets ≥44px

**Critical Elements**:
- Responsive CSS (≤480px, ≤600px breakpoints)

### Mobile Gradebook
- [ ] Resize to mobile width (<900px)
- [ ] Name and Roll No columns stay visible (fixed left)
- [ ] Marks columns scroll horizontally
- [ ] Can enter marks on mobile
- [ ] No overlapping columns

**Critical Elements**:
- Sticky column CSS
- Horizontal scroll behavior

---

## ERROR HANDLING

### Network Failure (Offline)
- [ ] Disconnect internet
- [ ] Try to login
- [ ] Error message appears
- [ ] No infinite loading
- [ ] Reconnect internet
- [ ] Can retry and succeed

**Critical Elements**:
- try/catch blocks
- Error alert display

### Invalid Form Inputs
- [ ] Try to signup with email without @
- [ ] Error: "Please fill in all fields" or similar
- [ ] Try to signup with password <8 characters
- [ ] Error: "Password must be at least 8 characters"
- [ ] Try to submit empty form
- [ ] Error: validation message

**Critical Elements**:
- Input validation before Supabase calls
- showAlert() function

### Session Expiry
- [ ] Login to dashboard
- [ ] Wait for JWT expiry (1 hour by default) OR manually clear session storage
- [ ] Try to perform action
- [ ] Redirected to login page
- [ ] Can login again

**Critical Elements**:
- Session check on page load
- Auth error handling

---

## DATA INTEGRITY

### Cascade Deletes
- [ ] Create class with students and marks
- [ ] Delete a student
- [ ] All marks for that student deleted (check database)
- [ ] No orphaned marks records

**Critical Elements**:
- ON DELETE CASCADE foreign keys
- students → marks cascade

### Unique Constraints
- [ ] Try to register student with duplicate roll number in same class
- [ ] Error or "already registered" state
- [ ] No duplicate records created

**Critical Elements**:
- UNIQUE(class_id, roll_no) constraint
- check-roll-taken Edge Function

### Null Handling
- [ ] Student with no email
- [ ] Can register successfully
- [ ] Marks with null values
- [ ] Display as "—" or empty
- [ ] No JavaScript errors on null

**Critical Elements**:
- Null checks in JavaScript
- Nullable database columns

---

## PERFORMANCE CHECKS

### Page Load Speed
- [ ] Dashboard loads in <3 seconds
- [ ] Join page loads in <2 seconds
- [ ] Teacher view loads in <3 seconds
- [ ] No blocking scripts

**Critical Elements**:
- Inline styles (no external CSS)
- CDN resources (Supabase JS)

### Large Data Sets
- [ ] Create 50+ students
- [ ] Add 10+ marks categories
- [ ] Dashboard still usable
- [ ] No significant lag when entering marks
- [ ] Filtering/search still fast

**Critical Elements**:
- Efficient filtering algorithms
- Debounced auto-save

### Realtime Performance
- [ ] Multiple users editing simultaneously
- [ ] No race conditions
- [ ] No data loss
- [ ] Updates appear for all users

**Critical Elements**:
- Optimistic concurrency
- UPSERT operations

---

## SECURITY CHECKS

### SQL Injection Prevention
- [ ] Try to enter SQL in student name: `'; DROP TABLE students; --`
- [ ] No SQL execution
- [ ] String stored as literal value

**Critical Elements**:
- Parameterized queries (Supabase)
- Input escaping

### XSS Prevention
- [ ] Try to enter script in student name: `<script>alert('XSS')</script>`
- [ ] No script execution
- [ ] String displayed as text

**Critical Elements**:
- .textContent vs .innerHTML
- HTML escaping in templates

### Authentication Bypass
- [ ] Logout
- [ ] Try to access dashboard.html directly
- [ ] Redirected to login page
- [ ] Cannot access without session

**Critical Elements**:
- Session check on page load
- Redirect logic

### Token Security
- [ ] Class link token is random (not sequential)
- [ ] Token is 32-character hex (high entropy)
- [ ] Cannot guess other class tokens
- [ ] Teacher view token separate from class link token

**Critical Elements**:
- generate_class_token() using gen_random_bytes(16)
- Separate tokens for different access levels

---

## BROWSER COMPATIBILITY

### Chrome/Edge (Chromium)
- [ ] All workflows work
- [ ] No console errors
- [ ] Animations smooth

### Firefox
- [ ] All workflows work
- [ ] CSS Grid and Flexbox render correctly
- [ ] Realtime updates work

### Safari (Desktop)
- [ ] All workflows work
- [ ] Sticky positioning works (gradebook)
- [ ] Font rendering acceptable

### Safari (iOS)
- [ ] Mobile layouts work
- [ ] Touch interactions responsive
- [ ] No zoom issues on input focus

---

## FINAL VERIFICATION

### Before Deployment
- [ ] All critical workflows pass
- [ ] No console errors on any page
- [ ] Visual changes applied consistently
- [ ] Branding updated everywhere
- [ ] Contact information updated
- [ ] Email templates tested (if changed)
- [ ] Mobile responsive at all breakpoints
- [ ] Cross-browser testing complete
- [ ] Performance acceptable
- [ ] Security checks pass

### Post-Deployment Monitoring
- [ ] Monitor error logs for 24 hours
- [ ] Check Supabase dashboard for anomalies
- [ ] Verify email deliverability
- [ ] Test production URLs
- [ ] Confirm database connections
- [ ] Check realtime sync in production

---

## REGRESSION SEVERITY LEVELS

### Critical (Deploy Blocker)
Issues that prevent core functionality:
- Cannot login
- Cannot register students
- Cannot enter marks
- Database errors
- Authentication bypass
- Data loss

### High (Fix Before Deploy)
Issues that break important workflows:
- Cannot approve students
- Marks don't save
- Realtime sync broken
- Email sending fails
- Mobile layout broken

### Medium (Fix After Deploy)
Issues that degrade experience:
- Toast notifications don't appear
- Search not working
- Filters not working
- Avatar upload fails
- Minor visual bugs

### Low (Backlog)
Issues that are cosmetic:
- Alignment issues
- Color inconsistencies
- Animation glitches
- Minor text errors

---

## TESTING NOTES

### Recommended Test Accounts
1. **TA Account A** - For primary testing
2. **TA Account B** - For multi-device sync testing
3. **Student Persona** - For join link testing

### Test Data
- At least 3 students (pending, approved, rejected)
- At least 2 marks categories
- At least 1 query with photos
- At least 2 classes (for class switching)

### Tools
- Chrome DevTools (console, network, responsive mode)
- Multiple browsers
- Multiple devices (desktop, tablet, phone)
- Incognito/private windows (for logout testing)

---

## SIGN-OFF

After completing this checklist:

- [ ] I have tested all critical workflows
- [ ] All issues found are documented
- [ ] Critical issues are resolved
- [ ] Visual changes are consistent
- [ ] Branding is updated correctly
- [ ] Application is ready for deployment

**Tested By**: ___________________
**Date**: ___________________
**Version/Branch**: ___________________
**Issues Found**: ___________________

---

## CONCLUSION

This checklist represents the **minimum testing required** before deploying visual or branding changes to production.

**Estimated Time**: 3-6 hours for complete regression testing

**Critical Rule**: If any CRITICAL severity issue is found, **DO NOT DEPLOY** until resolved.

Use this document every time you modify the codebase, especially after:
- Visual redesigns
- Branding changes
- Database migrations
- Edge Function updates
- Dependency updates

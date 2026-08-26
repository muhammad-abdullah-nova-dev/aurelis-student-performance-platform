# 🏗️ System Architecture

This document provides a comprehensive overview of the Aurelis platform architecture, including system design, data flow, security model, and technical decisions.

---

## Table of Contents

1. [High-Level Architecture](#high-level-architecture)
2. [Frontend Architecture](#frontend-architecture)
3. [Backend Architecture](#backend-architecture)
4. [Database Schema](#database-schema)
5. [Security Architecture](#security-architecture)
6. [Data Flow](#data-flow)
7. [Deployment Architecture](#deployment-architecture)
8. [Technical Decisions](#technical-decisions)

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT TIER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Landing Page │  │  Login/Auth  │  │  Dashboard   │     │
│  │ (index.html) │  │(login.html)  │  │(dashboard.   │     │
│  │              │  │              │  │ html)        │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Student Join │  │ Teacher View │  │ Password     │     │
│  │ (join.html)  │  │(teacher-view │  │ Reset        │     │
│  │              │  │ .html)       │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                      APPLICATION TIER                        │
│                     (Supabase BaaS)                         │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Authentication Service                   │  │
│  │  • JWT Token Management                              │  │
│  │  • Email/Password Auth                               │  │
│  │  • Session Management                                │  │
│  └──────────────────────────────────────────────────────┘  │
│                             │                               │
│  ┌──────────────────────────┴───────────────────────────┐  │
│  │           Edge Functions (Deno Runtime)              │  │
│  │  ┌────────────────┐  ┌────────────────┐             │  │
│  │  │ create-ta-     │  │ cleanup-failed-│             │  │
│  │  │ profile        │  │ signup         │             │  │
│  │  └────────────────┘  └────────────────┘             │  │
│  │  ┌────────────────┐  ┌────────────────┐             │  │
│  │  │ check-roll-    │  │ get-student-   │             │  │
│  │  │ taken          │  │ marks          │             │  │
│  │  └────────────────┘  └────────────────┘             │  │
│  │  ┌────────────────┐  ┌────────────────┐             │  │
│  │  │ get-ta-by-     │  │ get-teacher-   │             │  │
│  │  │ token          │  │ dashboard      │             │  │
│  │  └────────────────┘  └────────────────┘             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ PostgREST
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                        DATA TIER                             │
│                   PostgreSQL 17 Database                     │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ ta_profiles  │  │   classes    │  │   students   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐                       │
│  │    marks     │  │ RLS Policies │                       │
│  └──────────────┘  └──────────────┘                       │
│                                                             │
│         Row Level Security (RLS) Enabled                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Technology Stack
- **HTML5** - Semantic markup
- **CSS3** - Custom design system
- **Vanilla JavaScript** - No framework dependencies
- **Supabase JS Client v2** - API communication

### Design Patterns

#### 1. **Single Page Application (SPA) Lite**
Each HTML file is self-contained with embedded styles and scripts for:
- Fast loading
- No build process
- Easy deployment
- Offline-first capability

#### 2. **Component-Based UI**
```javascript
// Reusable UI patterns
function showSection(sectionId) { ... }
function renderStudentCard(student) { ... }
function showAlert(message, type) { ... }
```

#### 3. **State Management**
```javascript
// Simple global state
let currentClass = null;
let students = [];
let marks = {};

// Load and sync
async function loadAll() {
  await loadProfile();
  await loadStudents();
  await loadMarks();
}
```

### CSS Architecture

#### Design Token System
```css
:root {
  /* Brand Colors */
  --brand-primary: #C63D2F;
  --brand-secondary: #3E7A54;
  
  /* Surface Colors */
  --background: #F7F1E8;
  --surface: #EFE6D4;
  
  /* Text Colors */
  --text-primary: #1E1A17;
  --text-muted: #7A6E64;
  
  /* Spacing & Layout */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
}
```

#### Utility-First Approach
- Custom properties for theming
- Responsive breakpoints
- Flexbox/Grid for layout
- Mobile-first design

---

## Backend Architecture

### Supabase Stack

#### 1. **Authentication**
```typescript
// JWT-based authentication
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure_password'
});

// Session management
const { data: { session } } = await supabase.auth.getSession();
```

#### 2. **Database (PostgREST)**
```typescript
// Direct database queries with RLS
const { data, error } = await supabase
  .from('students')
  .select('*')
  .eq('class_id', classId);
```

#### 3. **Edge Functions (Deno)**
```typescript
// Serverless functions for complex logic
serve(async (req: Request) => {
  // JWT verification
  const token = req.headers.get('authorization');
  const { user } = await supabase.auth.getUser(token);
  
  // Business logic
  // ...
  
  return new Response(JSON.stringify(result));
});
```

### Edge Function Responsibilities

| Function | Purpose | Auth Required | RLS Bypass |
|----------|---------|---------------|------------|
| `create-ta-profile` | Create TA profile + first class | ✅ Yes | ✅ Yes |
| `cleanup-failed-signup` | Delete orphaned auth users | ✅ Yes | ✅ Yes |
| `check-roll-taken` | Validate student roll uniqueness | ❌ No | ✅ Yes |
| `get-student-marks` | Fetch student marks by roll | ❌ No | ✅ Yes |
| `get-ta-by-token` | Fetch TA info via class token | ❌ No | ✅ Yes |
| `get-teacher-dashboard` | Fetch class stats via token | ❌ No | ✅ Yes |

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐
│   auth.users    │
│ (Supabase Auth) │
└────────┬────────┘
         │ 1
         │
         │ 1
┌────────▼────────┐       1      ┌─────────────┐
│  ta_profiles    │───────────────│   classes   │
│                 │               │             │
│ • id (PK, FK)   │               │ • id (PK)   │
│ • ta_name       │               │ • ta_id (FK)│
│ • email         │               │ • name      │
│ • created_at    │               │ • sir_name  │
└─────────────────┘               │ • class_link│
                                  │   _token    │
                                  │ • teacher_  │
                                  │   view_token│
                                  │ • created_at│
                                  └──────┬──────┘
                                         │ 1
                                         │
                                         │ *
                                  ┌──────▼──────┐
                                  │  students   │
                                  │             │
                                  │ • id (PK)   │
                                  │ • class_id  │
                                  │   (FK)      │
                                  │ • roll_no   │
                                  │ • name      │
                                  │ • approved  │
                                  │ • created_at│
                                  └──────┬──────┘
                                         │ 1
                                         │
                                         │ *
                                  ┌──────▼──────┐
                                  │    marks    │
                                  │             │
                                  │ • id (PK)   │
                                  │ • student_id│
                                  │   (FK)      │
                                  │ • quiz_name │
                                  │ • obtained  │
                                  │ • total     │
                                  │ • created_at│
                                  └─────────────┘
```

### Table Details

#### **ta_profiles**
```sql
CREATE TABLE ta_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  ta_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### **classes**
```sql
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ta_id UUID NOT NULL REFERENCES ta_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sir_name TEXT,
  class_link_token TEXT UNIQUE NOT NULL,
  teacher_view_token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### **students**
```sql
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  roll_no TEXT NOT NULL,
  name TEXT NOT NULL,
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(class_id, roll_no)
);
```

#### **marks**
```sql
CREATE TABLE marks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  quiz_name TEXT NOT NULL,
  obtained INTEGER NOT NULL CHECK (obtained >= 0),
  total INTEGER NOT NULL CHECK (total > 0),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Security Architecture

### Multi-Layer Security Model

```
┌─────────────────────────────────────────────────┐
│              Application Layer                   │
│  • Input Validation                             │
│  • XSS Prevention                               │
│  • CORS Configuration                           │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│           Authentication Layer                   │
│  • JWT Token Verification                       │
│  • Session Management                           │
│  • Email Validation                             │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│          Authorization Layer                     │
│  • Ownership Verification                       │
│  • Time-Bound Operations                        │
│  • Role-Based Access                            │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│            Database Layer (RLS)                  │
│  • Row Level Security Policies                  │
│  • Tenant Isolation                             │
│  • Constraint Enforcement                       │
└─────────────────────────────────────────────────┘
```

### Row Level Security (RLS) Policies

#### **ta_profiles**
```sql
-- TAs can only read their own profile
CREATE POLICY "Users can view own profile"
  ON ta_profiles FOR SELECT
  USING (auth.uid() = id);

-- TAs can update their own profile
CREATE POLICY "Users can update own profile"
  ON ta_profiles FOR UPDATE
  USING (auth.uid() = id);
```

#### **classes**
```sql
-- TAs can view their own classes
CREATE POLICY "TAs can view own classes"
  ON classes FOR SELECT
  USING (ta_id = auth.uid());

-- TAs can manage their own classes
CREATE POLICY "TAs can manage own classes"
  ON classes FOR ALL
  USING (ta_id = auth.uid());
```

#### **students**
```sql
-- TAs can view students in their classes
CREATE POLICY "TAs can view students in their classes"
  ON students FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = students.class_id
      AND classes.ta_id = auth.uid()
    )
  );
```

#### **marks**
```sql
-- TAs can manage marks for their students
CREATE POLICY "TAs can manage marks for their students"
  ON marks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM students
      JOIN classes ON classes.id = students.class_id
      WHERE students.id = marks.student_id
      AND classes.ta_id = auth.uid()
    )
  );
```

### JWT Authentication Flow

```
1. User Signs Up/In
   ↓
2. Supabase Auth generates JWT
   ↓
3. Frontend stores JWT in session
   ↓
4. Every API call includes JWT in Authorization header
   ↓
5. Edge Function verifies JWT
   ↓
6. Extract user.id from verified JWT
   ↓
7. Use user.id for database operations
   ↓
8. RLS policies enforce ownership
```

---

## Data Flow

### TA Signup Flow

```
User Form → Frontend Validation → auth.signUp()
                                      ↓
                               Supabase Auth
                                      ↓
                              JWT Token Created
                                      ↓
                         create-ta-profile Edge Function
                                      ↓
                    ┌─────────────────┴─────────────────┐
                    ↓                                   ↓
            Insert ta_profiles                  Insert classes
            (with user.id from JWT)            (generate tokens)
                    ↓                                   ↓
                    └─────────────────┬─────────────────┘
                                      ↓
                            Return class details
                                      ↓
                           Redirect to Dashboard
```

### Student Join Flow

```
Class Invite Link → join.html
                        ↓
                Form Submission
                        ↓
            check-roll-taken Edge Function
                        ↓
        Validate roll_no uniqueness in class
                        ↓
            Insert into students table
         (approved = false by default)
                        ↓
            TA sees pending request
                        ↓
                TA approves student
                        ↓
            Update approved = true
                        ↓
         Student can now view marks
```

### Marks Entry Flow

```
TA Dashboard → Marks Section
                    ↓
          Select Quiz + Students
                    ↓
            Enter marks per student
                    ↓
               Submit marks
                    ↓
         Bulk insert into marks table
                    ↓
        send-marks-email Edge Function
                    ↓
         Email notification to students
                    ↓
     Students see marks in their dashboard
```

---

## Deployment Architecture

### Production Environment

```
┌────────────────────────────────────────────┐
│         CDN (GitHub Pages)                  │
│  • Static HTML/CSS/JS files                │
│  • Global edge network                     │
│  • HTTPS enabled                           │
│  • Custom domain support                   │
└───────────────┬────────────────────────────┘
                │
                │ HTTPS
                ▼
┌────────────────────────────────────────────┐
│      Supabase Cloud (Mumbai Region)        │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │    PostgreSQL Database (Managed)     │ │
│  │    • Auto-scaling                    │ │
│  │    • Automatic backups               │ │
│  │    • Point-in-time recovery          │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │   Edge Functions (Deno Runtime)      │ │
│  │    • Auto-scaling                    │ │
│  │    • Cold start optimization         │ │
│  │    • Environment variables           │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │   Authentication (Supabase Auth)     │ │
│  │    • JWT token management            │ │
│  │    • Email verification              │ │
│  │    • Session management              │ │
│  └──────────────────────────────────────┘ │
└────────────────────────────────────────────┘
```

### CI/CD Pipeline

```
Developer → Git Push → GitHub
                         ↓
                   GitHub Actions
                         ↓
                 Build & Deploy
                         ↓
              ┌──────────┴──────────┐
              ↓                     ↓
        GitHub Pages          Supabase CLI
     (Frontend Deploy)     (Functions Deploy)
```

---

## Technical Decisions

### Why No Frontend Framework?

**Decision:** Use vanilla JavaScript instead of React/Vue/Angular

**Rationale:**
- ✅ Zero build time
- ✅ Faster loading (no framework overhead)
- ✅ Easier deployment
- ✅ Simple maintenance
- ✅ No dependency vulnerabilities
- ❌ Less code reusability (acceptable tradeoff for this project size)

### Why Supabase Over Custom Backend?

**Decision:** Use Supabase BaaS instead of Node.js/Express

**Rationale:**
- ✅ Managed database (no ops overhead)
- ✅ Built-in authentication
- ✅ Row Level Security
- ✅ Real-time capabilities
- ✅ Edge Functions (serverless)
- ✅ Auto-scaling
- ✅ Free tier suitable for MVP
- ❌ Vendor lock-in (mitigated by open-source nature of Supabase)

### Why Edge Functions?

**Decision:** Use Edge Functions for sensitive operations

**Rationale:**
- ✅ Service role access (bypass RLS when needed)
- ✅ JWT verification
- ✅ Complex business logic
- ✅ Email sending
- ✅ Token generation
- ✅ Serverless (no infrastructure management)

### Why GitHub Pages?

**Decision:** Use GitHub Pages for frontend hosting

**Rationale:**
- ✅ Free hosting
- ✅ Automatic deployment from Git
- ✅ HTTPS by default
- ✅ Custom domain support
- ✅ Global CDN
- ✅ No server configuration needed
- ❌ Static only (not an issue for this architecture)

---

## Performance Considerations

### Frontend Optimization
- ✅ Embedded styles (eliminates extra HTTP requests)
- ✅ Minimal JavaScript (< 2KB per page)
- ✅ Lazy loading for images
- ✅ CSS Grid/Flexbox (GPU-accelerated)

### Backend Optimization
- ✅ Database indexing on foreign keys
- ✅ RLS policies use indexed columns
- ✅ Connection pooling (Supabase managed)
- ✅ Edge Function cold start < 200ms

### Scaling Strategy
- **Horizontal:** Supabase auto-scales
- **Vertical:** Upgrade database tier if needed
- **Caching:** Browser caching for static assets
- **CDN:** GitHub Pages edge network

---

## Monitoring & Observability

### Logs
- **Supabase Dashboard:** Edge Function logs
- **PostgreSQL Logs:** Query performance
- **Auth Logs:** Login attempts, errors

### Metrics
- **Response Time:** < 500ms (p95)
- **Error Rate:** < 1%
- **Availability:** 99.9% uptime (Supabase SLA)

---

## Future Architecture Improvements

### Planned Enhancements
- [ ] Redis caching layer
- [ ] GraphQL API (Hasura)
- [ ] Real-time notifications (WebSocket)
- [ ] Mobile app (React Native)
- [ ] Microservices for complex operations
- [ ] Multi-region deployment
- [ ] Advanced analytics (Mixpanel/PostHog)

---

## Conclusion

The Aurelis platform follows a modern, serverless architecture that prioritizes:
- **Security:** Multi-layer security with RLS + JWT
- **Simplicity:** Minimal dependencies, easy deployment
- **Scalability:** Auto-scaling backend, global CDN
- **Maintainability:** Clean code, comprehensive documentation
- **Cost-Effectiveness:** Free tier usage, pay-as-you-grow model

This architecture enables rapid development while maintaining production-grade security and performance.

# BRANDING INVENTORY

## PURPOSE

This document catalogs every occurrence of branding, ownership identity, and contact information in the codebase. Each entry is classified by type and safety for modification during a rebrand.

---

## CLASSIFICATION LEGEND

**Type Classifications:**
- **USER_VISIBLE** - Displayed to end users in the application UI
- **DOCUMENTATION** - In comments, README files, or developer notes
- **EMAIL** - In automated email templates
- **TECHNICAL** - In code identifiers, URLs, or backend references
- **CONTACT** - Owner contact information

**Safety Classifications:**
- **SAFE** - Can be changed during visual rebrand without breaking functionality
- **CAUTION** - Can be changed but requires testing (e.g., email templates)
- **PROTECTED** - Must not be changed (technical identifiers, database names)
- **OWNER_INFO** - Contact information to be updated during ownership transfer

---

## BRANDING: "TA Portal"

### Product Name Occurrences

| Location | Value | Type | User Visible? | Safe to Change? | Notes |
|----------|-------|------|---------------|-----------------|-------|
| **index.html** | | | | | |
| Line 5 (title) | `TA Portal — Teaching Assistant Management System` | USER_VISIBLE | Yes | SAFE | Browser tab title |
| Line 73 (logo) | `TA<span>Portal</span>` | USER_VISIBLE | Yes | SAFE | Navigation logo |
| Line 81 (nav) | `TA<span>Portal</span>` | USER_VISIBLE | Yes | SAFE | Navigation text |
| Line 169 (footer) | `TA<span>Portal</span>` | USER_VISIBLE | Yes | SAFE | Footer branding |
| **login.html** | | | | | |
| Line 5 (title) | `TA Portal — Login / Sign Up` | USER_VISIBLE | Yes | SAFE | Browser tab title |
| Line 72 (logo) | `TA<span>Portal</span>` | USER_VISIBLE | Yes | SAFE | Logo link text |
| Line 173 (footer) | `Powered by <a href="index.html">TA Portal</a>` | USER_VISIBLE | Yes | SAFE | Footer powered-by text |
| **reset-password.html** | | | | | |
| Line 5 (title) | `TA Portal — Reset Password` | USER_VISIBLE | Yes | SAFE | Browser tab title |
| Line 50 (logo) | `TA<span>Portal</span>` | USER_VISIBLE | Yes | SAFE | Logo link text |
| **dashboard.html** | | | | | |
| Line 5 (title) | `TA Portal — Dashboard` | USER_VISIBLE | Yes | SAFE | Browser tab title |
| Line 123 (sidebar logo) | `TA<span>Portal</span>` | USER_VISIBLE | Yes | SAFE | Sidebar branding |
| Line 356 (footer) | `TA Portal — Class Progress` | USER_VISIBLE | Yes | SAFE | Page title |
| **join.html** | | | | | |
| Line 5 (title) | `TA Portal — Join Class` | USER_VISIBLE | Yes | SAFE | Browser tab title |
| Line 94 (logo) | `TA<span>Portal</span>` | USER_VISIBLE | Yes | SAFE | Logo text |
| Line 183 (footer) | `Powered by <a href="index.html">TA Portal</a>` | USER_VISIBLE | Yes | SAFE | Footer powered-by text |
| Line 203 (document title) | `Join ${data.ta_name}'s Class — TA Portal` | USER_VISIBLE | Yes | SAFE | Dynamic browser title |
| **teacher-view.html** | | | | | |
| Line 5 (title) | `TA Portal — Class Progress` | USER_VISIBLE | Yes | SAFE | Browser tab title |
| Line 104 (logo) | `TA<span>Portal</span> — Class Progress` | USER_VISIBLE | Yes | SAFE | Page header |
| **send-marks-email/index.ts** | | | | | |
| Line 47 (email from) | `TA Portal <noreply@your-domain.com>` | EMAIL | Yes (email recipient) | CAUTION | Email sender name |
| Line 94 (email heading) | `<h1>TA Portal 🎓</h1>` | EMAIL | Yes (email recipient) | CAUTION | Email header |
| Line 134 (email footer) | `TA Portal &nbsp;·&nbsp; Automated email` | EMAIL | Yes (email recipient) | CAUTION | Email footer |
| Line 160 (email heading) | `<h1>TA Portal ⚠️</h1>` | EMAIL | Yes (email recipient) | CAUTION | Reminder email header |
| Line 183 (email footer) | `TA Portal &nbsp;·&nbsp; Automated reminder` | EMAIL | Yes (email recipient) | CAUTION | Reminder email footer |

### Logo Pattern

**Current Pattern**: `TA<span>Portal</span>`
- "TA" in default text color
- "Portal" in accent red (`--accent: #C63D2F`)
- HTML structure must be preserved for CSS styling

**To Rebrand**:
1. Replace "TA" with new first word
2. Replace "Portal" with new second word
3. Keep the `<span>` wrapper for color styling
4. Update all occurrences listed above

---

## OWNER CONTACT INFORMATION

### Developer: Farhan Farooq

| Location | Email | Phone | Type | User Visible? | Safe to Change? |
|----------|-------|-------|------|---------------|-----------------|
| **login.html** | farhanfarooqw@gmail.com | +92 314 9264891 | CONTACT | Yes (footer) | OWNER_INFO |
| **dashboard.html** | farhanfarooqw@gmail.com | +92 314 9264891 | CONTACT | Yes (sidebar) | OWNER_INFO |
| **index.html** | farhanfarooqw@gmail.com | +92 314 9264891 | CONTACT | Yes (footer) | OWNER_INFO |

#### login.html - Line 173
```html
<div style="position:fixed;bottom:12px;left:0;right:0;text-align:center;font-size:0.78rem;color:var(--muted);z-index:2;">
  Need help? 📧 <a href="mailto:farhanfarooqw@gmail.com" style="color:var(--accent);text-decoration:none;">farhanfarooqw@gmail.com</a>
  &nbsp;·&nbsp; 💬 <a href="https://wa.me/923149264891" target="_blank" style="color:var(--accent);text-decoration:none;">+92 314 9264891</a>
</div>
```

#### dashboard.html - Sidebar footer (approx line 160)
```html
<div style="font-size:0.72rem;color:var(--muted);text-align:center;margin-top:10px;line-height:1.6;">
  Need help?<br/>
  📧 <a href="mailto:farhanfarooqw@gmail.com" style="color:var(--accent);text-decoration:none;">Email</a>
  &nbsp;·&nbsp;
  💬 <a href="https://wa.me/923149264891" target="_blank" style="color:var(--accent);text-decoration:none;">WhatsApp</a>
</div>
```

#### index.html - Footer (Line 169)
```html
<footer id="contact">
  <div class="logo">TA<span>Portal</span></div>
  <div>Built with ❤️ for Teaching Assistants</div>
  <div style="font-size:0.85rem;">
    📧 <a href="mailto:farhanfarooqw@gmail.com">farhanfarooqw@gmail.com</a>
    &nbsp;·&nbsp;
    💬 <a href="https://wa.me/923149264891" target="_blank">+92 314 9264891</a>
  </div>
</footer>
```

**Replacement Instructions**:
1. Search for `farhanfarooqw@gmail.com` (3 occurrences)
2. Search for `923149264891` (3 occurrences - note: no + prefix in WhatsApp URLs)
3. Replace email with new support email
4. Replace phone with new support WhatsApp number
5. Update `href` attributes for both email (`mailto:`) and WhatsApp (`https://wa.me/`)

---

## DOMAIN/URL REFERENCES

### Supabase Project URL

| Location | Value | Type | User Visible? | Safe to Change? |
|----------|-------|------|---------------|-----------------|
| **All HTML files** | `https://loxxobhsyhqaslpqqrqe.supabase.co` | TECHNICAL | No | PROTECTED |
| **All Edge Functions** | `Deno.env.get("SUPABASE_URL")` | TECHNICAL | No | PROTECTED |

**Status**: **DO NOT CHANGE** - This is the actual Supabase project URL. Changing it requires:
1. Migrating to a new Supabase project
2. Updating environment variables
3. Updating all HTML files
4. Redeploying all Edge Functions

### Supabase Anon Key

| Location | Value | Type | User Visible? | Safe to Change? |
|----------|-------|------|---------------|-----------------|
| **All HTML files** | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | TECHNICAL | No | PROTECTED |

**Status**: **DO NOT CHANGE** - Public anon key for Supabase client authentication

---

## HARDCODED TEXT CONTENT

### Marketing Copy (index.html)

#### Hero Section
- **Headline**: "Grading shouldn't feel like homework"
- **Subheading**: "TA Portal keeps your roster, marks, and Google Sheet in sync — so the only thing left to do is teach."
- **CTA Buttons**: "Get Started Free →" | "See How It Works"
- **Stats**:
  - "Free" - "No cost, ever"
  - "Live" - "Sheets sync"
  - "Yours" - "You approve who joins"

**Safe to Change**: YES - All marketing copy can be rewritten

#### Features Section
1. "Marks that sync themselves" - Type a mark in the portal and it lands in your Google Sheet automatically...
2. "One link for your whole class" - Share a single invite link...
3. "You decide who's in" - Every student who registers waits for your approval...
4. "Nobody falls through the cracks" - Keep track of who's missing marks or attendance...
5. "Stored safely, always there" - Every roster, mark, and record lives securely in the cloud...
6. "Your class, clearly labelled" - Your name and your Sir's name show right on the join page...

**Safe to Change**: YES - Feature descriptions can be rewritten

#### How It Works
1. "Sign up" - Add your name, your Sir's name, and your course.
2. "Share your link" - Send your class its own invite link.
3. "Students register" - They enter their roll number and name.
4. "You approve" - Only the students you confirm make the roster.
5. "Enter & sync" - Marks go straight to your Google Sheet.

**Safe to Change**: YES - Step descriptions can be rewritten

#### Footer
- "Built with ❤️ for Teaching Assistants"

**Safe to Change**: YES - Footer tagline can be changed

---

## EMAIL TEMPLATE BRANDING

### send-marks-email/index.ts

#### Marks Notification Email
- **Header**: "TA Portal 🎓" + "Your marks are here!"
- **Footer**: "TA Portal · Automated email · Do not reply"
- **From Name**: "TA Portal"
- **From Address**: "noreply@your-domain.com" ⚠️ **MUST BE UPDATED**

#### Missing Marks Reminder Email
- **Header**: "TA Portal ⚠️" + "Missing marks reminder"
- **Footer**: "TA Portal · Automated reminder · Do not reply"
- **From Name**: "TA Portal"
- **From Address**: "noreply@your-domain.com" ⚠️ **MUST BE UPDATED**

**Rebrand Instructions**:
1. Replace "TA Portal" in email headers (Lines 94, 160)
2. Replace "TA Portal" in email footers (Lines 134, 183)
3. Update `from` field from name: `from: 'TA Portal <noreply@...>'` (Line 47)
4. ⚠️ **CRITICAL**: Replace `noreply@your-domain.com` with actual verified email domain

**Email Domain Requirements**:
- Must be verified in Resend account
- Must have SPF/DKIM records configured
- Cannot use gmail.com, yahoo.com, etc. (requires custom domain)

---

## METADATA & SEO

### Page Titles (Browser Tabs)

| Page | Current Title | Safe to Change? |
|------|---------------|-----------------|
| index.html | "TA Portal — Teaching Assistant Management System" | SAFE |
| login.html | "TA Portal — Login / Sign Up" | SAFE |
| reset-password.html | "TA Portal — Reset Password" | SAFE |
| dashboard.html | "TA Portal — Dashboard" | SAFE |
| join.html | "TA Portal — Join Class" | SAFE |
| teacher-view.html | "TA Portal — Class Progress" | SAFE |

**Rebrand Instructions**:
Replace "TA Portal" prefix in all `<title>` tags (Line 5 in each HTML file)

---

## FAVICON & LOGO ASSETS

### Current Status
**NO FAVICON FOUND** - No `<link rel="icon">` tags in any HTML file

### Missing Assets
- No favicon.ico
- No logo image files (PNG, SVG, etc.)
- Logo is text-only using CSS styling

**For Rebrand**:
1. Create favicon (16x16, 32x32, 180x180 recommended sizes)
2. Add `<link rel="icon" href="/favicon.ico">` to all HTML files
3. Consider creating logo image assets if text-only logo is replaced

---

## CODE COMMENTS & DEVELOPER NOTES

### No Developer Branding Found
- No branded comments in HTML files
- No branded comments in Edge Function code
- No branded comments in SQL schema

**Edge Function Headers** (send-marks-email/index.ts):
```typescript
// ============================================================
//  TA PORTAL — Supabase Edge Function
//  File: supabase/functions/send-marks-email/index.ts
// ============================================================
```

**Safe to Change**: YES - Comment headers can be updated

---

## THIRD-PARTY SERVICE REFERENCES

### Google Fonts
- Plus Jakarta Sans (body text)
- Fraunces (headings)
- Caveat (handwriting accents)

**Safe to Change**: YES - Can swap fonts as long as fallbacks exist

### CDN Resources
- Supabase JS Client: `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2`

**Safe to Change**: NO - Required for functionality

### External Links
- WhatsApp: `https://wa.me/{phone}`
- Email: `mailto:{email}`

**Safe to Change**: YES - Update contact info as needed

---

## SEARCH & REPLACE SUMMARY

### Global Search Terms

To prepare for rebrand, search entire codebase for:

1. **"TA Portal"** (case-sensitive)
   - Expected: ~20+ matches
   - Action: Replace with new product name

2. **"TAPortal"** (no space, case-sensitive)
   - Expected: 0 matches (not used in this codebase)

3. **"farhanfarooqw@gmail.com"**
   - Expected: 3 matches
   - Action: Replace with new support email

4. **"923149264891"**
   - Expected: 3 matches
   - Action: Replace with new WhatsApp number (without + prefix)

5. **"+92 314 9264891"**
   - Expected: 3 matches
   - Action: Replace with new display phone number (with + prefix)

6. **"Built with ❤️ for Teaching Assistants"**
   - Expected: 1 match (index.html footer)
   - Action: Replace with new tagline

7. **"noreply@your-domain.com"**
   - Expected: 1 match (send-marks-email)
   - Action: Replace with actual verified email address

---

## REBRAND CHECKLIST

### Phase 1: Planning
- [ ] Choose new product name
- [ ] Verify new name availability (domain, trademarks)
- [ ] Design new logo (if replacing text logo)
- [ ] Create favicon assets
- [ ] Set up verified email domain for transactional emails
- [ ] Prepare new support contact information

### Phase 2: Visual Changes (SAFE)
- [ ] Update all page titles (`<title>` tags)
- [ ] Replace logo text in all HTML files
- [ ] Update footer branding
- [ ] Update email template headers/footers
- [ ] Create and add favicon files
- [ ] Update marketing copy (hero, features, how-it-works)

### Phase 3: Contact Information (SAFE)
- [ ] Replace developer email (3 files)
- [ ] Replace WhatsApp number (3 files)
- [ ] Update email sender name
- [ ] Update transactional email "from" address
- [ ] Test email deliverability after domain change

### Phase 4: Testing (CRITICAL)
- [ ] Test all pages load correctly
- [ ] Test login/signup flow
- [ ] Test password reset emails
- [ ] Test student registration
- [ ] Test marks notification emails
- [ ] Verify email SPF/DKIM records
- [ ] Check all external links work
- [ ] Verify branding consistency across all pages

### Phase 5: Deployment
- [ ] Deploy updated HTML files
- [ ] Deploy updated Edge Functions
- [ ] Clear CDN caches if applicable
- [ ] Monitor error logs for 24 hours

---

## NOTES & WARNINGS

### What NOT to Change
- Supabase project URL
- Supabase anon key
- Database table names
- Database column names
- Edge Function names
- DOM element IDs
- JavaScript function names
- CSS class names used in JavaScript
- Storage bucket names
- URL query parameter names

### Low-Risk Changes
- Page titles
- Logo text
- Marketing copy
- Footer text
- Button labels (visual only)
- Color scheme (CSS variables)
- Typography (font families)

### Medium-Risk Changes
- Email templates (test deliverability)
- Contact information (verify links work)
- Asset paths (if adding favicon/logo images)

### What Requires Testing
- Any change to email "from" address (deliverability)
- Any change to WhatsApp links (proper formatting)
- Any change to mailto: links (proper encoding)
- Page title changes (browser compatibility)

### Regulatory Considerations
- If changing ownership, update privacy policy
- If changing email domain, update GDPR compliance docs
- If changing contact info, update terms of service
- Consider user notification for major rebrand

---

## CONCLUSION

This inventory represents a **complete catalog of all branding touchpoints** in the TA Portal codebase.

**Summary**:
- **Product Name**: Appears in 15+ locations (safe to change)
- **Contact Information**: 3 files (email + phone, safe to update)
- **Email Templates**: 2 templates in 1 Edge Function (safe, test required)
- **Technical Identifiers**: 0 branded identifiers (already generic)

**Rebrand Effort**: **LOW TO MEDIUM**
- Most changes are simple search-and-replace
- No technical identifiers need changing
- Primary work is visual consistency testing
- Email deliverability testing is the main risk

**Estimated Time**: 2-4 hours for complete rebrand + testing

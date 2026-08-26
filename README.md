# 📚 Aurelis - Teaching Assistant Management System

A modern, secure web application designed to streamline grading workflows for teaching assistants and provide real-time performance insights for students and instructors.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://muhammad-abdullah-nova-dev.github.io/aurelis-student-performance-platform/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE.md)
[![Supabase](https://img.shields.io/badge/backend-Supabase-green)](https://supabase.com)

---

## 🌟 Features

### For Teaching Assistants
- **Effortless Signup** - Quick account creation with email verification
- **Class Management** - Generate shareable class links for student enrollment
- **Real-time Roster** - Automatic student enrollment with approval workflow
- **Flexible Grading** - Create unlimited quizzes and grade multiple students simultaneously
- **Email Notifications** - Automated marks notifications to students
- **Progress Tracking** - Visual dashboards showing class performance metrics

### For Students
- **One-Click Enrollment** - Join classes via secure invite links
- **Instant Access** - View marks immediately after TA approval
- **Performance Insights** - Track progress across multiple quizzes
- **Email Alerts** - Receive notifications when new marks are posted

### For Teachers
- **Read-Only Dashboard** - Monitor class progress via secure token
- **Class Analytics** - Overall statistics and student performance
- **No Login Required** - Direct access via shareable link

---

## 🚀 Live Demo

**Production:** [https://muhammad-abdullah-nova-dev.github.io/aurelis-student-performance-platform/](https://muhammad-abdullah-nova-dev.github.io/aurelis-student-performance-platform/)

### Test Accounts
- Create your own TA account via the signup page
- Generate a class link and test the full workflow

---

## 🛠️ Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Custom design system with CSS variables
- **Vanilla JavaScript** - No framework dependencies
- **Responsive Design** - Mobile-first approach

### Backend & Infrastructure
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Row Level Security (RLS)
  - Authentication & authorization
  - Edge Functions (Deno runtime)
  - Real-time subscriptions
- **GitHub Pages** - Frontend hosting
- **Git** - Version control

### Security
- JWT-based authentication
- Row-level security policies
- Email validation
- Ownership verification
- CORS protection
- Time-bound operations

---

## 📦 Installation & Setup

### Prerequisites
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Git](https://git-scm.com/)
- Modern web browser
- Text editor (VS Code recommended)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/muhammad-abdullah-nova-dev/aurelis-student-performance-platform.git
   cd aurelis-student-performance-platform
   ```

2. **Install Supabase CLI** (if not already installed)
   ```bash
   # Using npm
   npm install -g supabase

   # Or using Scoop (Windows)
   scoop install supabase
   ```

3. **Link to your Supabase project**
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

4. **Deploy database migrations**
   ```bash
   supabase db push
   ```

5. **Deploy Edge Functions**
   ```bash
   supabase functions deploy create-ta-profile
   supabase functions deploy cleanup-failed-signup
   supabase functions deploy check-roll-taken
   supabase functions deploy get-student-marks
   supabase functions deploy get-ta-by-token
   supabase functions deploy get-teacher-dashboard
   ```

6. **Update API credentials**
   - Get your Supabase URL and anon key from the [Supabase Dashboard](https://supabase.com/dashboard)
   - Update credentials in all HTML files:
     - `login.html`
     - `dashboard.html`
     - `join.html`
     - `teacher-view.html`
     - `reset-password.html`

7. **Start local server**
   ```bash
   python -m http.server 8000
   # Or use any static file server
   ```

8. **Open in browser**
   ```
   http://localhost:8000
   ```

---

## 📁 Project Structure

```
aurelis-student-performance-platform/
├── index.html                 # Landing page
├── login.html                 # Authentication page
├── dashboard.html             # TA dashboard
├── join.html                  # Student enrollment
├── teacher-view.html          # Read-only teacher view
├── reset-password.html        # Password recovery
├── supabase/
│   ├── functions/            # Edge Functions
│   │   ├── create-ta-profile/
│   │   ├── cleanup-failed-signup/
│   │   ├── check-roll-taken/
│   │   ├── get-student-marks/
│   │   ├── get-ta-by-token/
│   │   └── get-teacher-dashboard/
│   ├── migrations/           # Database migrations
│   │   ├── 0001_initial_schema.sql
│   │   └── 0002_harden_anonymous_registration.sql
│   └── config.toml           # Supabase configuration
├── docs/                      # Documentation
├── README.md                  # This file
├── ARCHITECTURE.md            # System architecture
├── BACKEND.md                 # Backend documentation
└── LICENSE.md                 # License information
```

---

## 🎯 Usage

### TA Workflow

1. **Sign Up**
   - Navigate to login page
   - Click "Create Account"
   - Fill in name, email, course, and professor details
   - System creates class and generates invite link

2. **Manage Students**
   - Share class invite link with students
   - Approve student enrollment requests
   - View roster in real-time

3. **Enter Marks**
   - Create quizzes with custom names
   - Bulk entry for multiple students
   - Submit to trigger email notifications

4. **Monitor Progress**
   - View statistics on dashboard
   - Generate teacher view links
   - Export data if needed

### Student Workflow

1. **Join Class**
   - Receive invite link from TA
   - Enter roll number and name
   - Submit enrollment request

2. **Access Marks**
   - Wait for TA approval
   - Login to view dashboard
   - Check marks across quizzes
   - Receive email notifications

---

## 🔐 Security Features

- **JWT Authentication** - Secure token-based auth
- **Row Level Security** - Database-level access control
- **Email Validation** - Prevents profile injection
- **Ownership Verification** - Users can only modify their own data
- **Time-Bound Cleanup** - 5-minute window for failed signups
- **CORS Protection** - Controlled cross-origin access
- **SQL Injection Prevention** - Parameterized queries
- **XSS Protection** - Input sanitization

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed security architecture.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style
- Test all changes locally
- Update documentation as needed
- Ensure security best practices

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

---

## 👨‍💻 Author

**Muhammad Abdullah**
- Email: muhammed.abdullah.coder@gmail.com
- WhatsApp: +92 322 6334814
- GitHub: [@muhammad-abdullah-nova-dev](https://github.com/muhammad-abdullah-nova-dev)

---

## 🙏 Acknowledgments

- **Supabase** - For the excellent BaaS platform
- **GitHub** - For hosting and version control
- **Open Source Community** - For inspiration and tools

---

## 📞 Support

For issues, questions, or feature requests:
- 📧 Email: muhammed.abdullah.coder@gmail.com
- 💬 WhatsApp: +92 322 6334814
- 🐛 [GitHub Issues](https://github.com/muhammad-abdullah-nova-dev/aurelis-student-performance-platform/issues)

---

## 🗺️ Roadmap

### Upcoming Features
- [ ] Google Sheets integration
- [ ] Bulk student import
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Export to PDF/Excel
- [ ] Assignment submissions

---

## ⭐ Show Your Support

If you find this project useful, please consider giving it a star on GitHub!

[![GitHub stars](https://img.shields.io/github/stars/muhammad-abdullah-nova-dev/aurelis-student-performance-platform?style=social)](https://github.com/muhammad-abdullah-nova-dev/aurelis-student-performance-platform)

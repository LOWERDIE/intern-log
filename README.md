# 📝 Internship Log

A beautiful, modern web application for tracking and managing your internship daily logs. Built with Next.js 14, TypeScript, Firebase, and featuring a premium glassmorphism UI design.

## ✨ Features

- **🔐 Secure Authentication** - Email/Password login with Firebase Auth
- **📊 Dual View Modes** - Switch between List and Table views
- **🔗 Work Link Attachment** - Attach optional URLs to your work logs
- **⏰ Hours Tracking** - Track 4 or 8 hour work sessions with automatic statistics
- **📈 Statistics Dashboard** - View total hours, days, and months at a glance
- **🗑️ Bulk Operations** - Select multiple logs and delete with safety confirmation
- **✏️ Edit Logs** - Update your existing log entries
- **🔍 Log Details** - View full log details in a beautiful modal popup
- **📥 Excel Export** - Export your logs to Excel format instantly (includes work links)
- **🌐 Bilingual Support** - Thai and English language toggle
- **📱 Fully Responsive** - Optimized for desktop, tablet, and mobile
- **🎨 Premium UI** - Modern design with glassmorphism effects and smooth animations
- **⚡ Real-time Sync** - Firebase Firestore for instant data synchronization

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Backend**: [Firebase](https://firebase.google.com/)
  - Authentication
  - Firestore Database
- **Export**: [SheetJS (xlsx)](https://sheetjs.com/)
- **Fonts**: [Noto Sans Thai](https://fonts.google.com/noto/specimen/Noto+Sans+Thai)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Firebase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/LOWERDIE/intern-log.git
   cd intern-log
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Set up Firebase**
   - Enable Email/Password authentication in Firebase Console
   - Create a Firestore database
   - Update security rules (see [Deployment Guide](#deployment))

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📂 Project Structure

```
intern-log/
├── src/
│   ├── app/
│   │   ├── login/          # Login page
│   │   ├── page.tsx        # Dashboard page
│   │   └── globals.css     # Global styles
│   ├── components/
│   │   ├── Navbar.tsx      # Navigation bar
│   │   ├── LogTable.tsx    # Table view component
│   │   ├── LogDetailsModal.tsx
│   │   └── DeleteConfirmationModal.tsx
│   ├── context/
│   │   └── LanguageContext.tsx  # i18n context
│   └── lib/
│       └── firebase.ts     # Firebase configuration
├── public/                 # Static assets
└── package.json
```

## 🎨 Features Showcase

### Modern Login Page
- Split-screen design with branding and form
- Glassmorphism effect with animated background
- Show/hide password toggle

### Dashboard
- **Statistics Summary** - View total hours, days (hours÷8), and months (days÷22)
- **New Entry Form** - Add date, hours (4 or 8), description, and optional work link
- **Recent Logs** - View all your logs in list or table format
- **Work Links** - Clickable links displayed in log details
- **Export to Excel** - Download logs as .xlsx file with all fields

### Security
- User authentication required
- Row-level security (each user sees only their logs)
- Confirmation required before deletion

## 🌍 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

### Firebase Production Setup

Update Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /logs/{logId} {
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow read, update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

For detailed deployment instructions, see the [Deployment Guide](./DEPLOYMENT_GUIDE.md).

## 📝 Usage

1. **Login** - Use your email and password
2. **Add Entry** - Fill in the date and description, then click "Save Entry"
3. **View Logs** - Switch between List and Table views
4. **Select & Delete** - Check multiple logs and delete them with confirmation
5. **Export** - Click "Export to Excel" to download your logs
6. **Language** - Toggle between Thai (TH) and English (EN)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Developer

Created with ❤️ by [LOWERDIE](https://github.com/LOWERDIE)
TS IS VIBECODING BRO 😭😭😭
---

**Note**: This is a personal project for internship log management. Feel free to fork and customize for your needs!

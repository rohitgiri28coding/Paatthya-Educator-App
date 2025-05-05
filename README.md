Here's an **updated and enriched version** of your README file that includes recent clarifications and polishes for better clarity and structure. I've refined the language and added missing parts such as link-based material uploads and role emphasis.

---

# 🎓 Paatthya Educator App – Coaching Admin Panel

A comprehensive **web-based admin panel** designed for coaching institutes to seamlessly manage batches, learning materials (via links), and student announcements. Built using modern web technologies, it enables efficient collaboration between educators and learners.

---

## ✨ Key Features

### 🔐 Authentication

* **Firebase Auth**: Secure email/password login powered by Firebase
* **Skip Login (Dev Mode)**: Quickly access the dashboard for testing without authentication

---

### 📚 Batches Management

* **Dashboard Overview**: View all batches with:

  * Title, image, price, and MRP
  * *Limited-Time Deal* badge for special offers
* **Batch Operations**: Add, edit, or delete batches in real-time

---

### 🎥 Learning Materials Management

Within each batch:

* **Lectures**: Add lecture links (e.g., YouTube, Drive)
* **Notes**: Attach links to study materials (PDFs, Google Docs, etc.)
* **Assignments**: Provide assignment links and update them as needed

> 🚫 No large file uploads — only **external links** are accepted to keep the app lightweight and efficient.

---

### 📢 Notice Board

* **Post Announcements**: Add notices with rich text and optional file attachments
* **File Indicators**: Visual icons for file types (PDF, DOCX, etc.)
* **Download Status**: Track whether files have been accessed by students

---

## 🧱 Tech Stack

| Layer        | Technology              |
| ------------ | ----------------------- |
| Frontend     | React + Tailwind CSS    |
| Backend / DB | Firebase Firestore      |
| Auth         | Firebase Authentication |
| Build Tool   | Vite                    |

---

## 🚀 Getting Started

### ✅ Prerequisites

* Node.js and npm installed

### 🔧 Installation

1. Clone the repository

   ```bash
   git clone https://github.com/your-username/PaatthyaEducatorApp.git
   cd PaatthyaEducatorApp
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Setup Firebase

   * Go to [Firebase Console](https://console.firebase.google.com/)
   * Enable Firestore & Email/Password Authentication
   * Copy your Firebase config and paste it into `src/firebase/firebase.js`

4. Run the development server

   ```bash
   npm run dev
   ```

---

## ⚙️ Project Structure

```
/src
├── /assets            # Static images & files
├── /components        # Reusable UI components
├── /pages             # Dashboard, Login, Batch Details, Notices
├── /firebase          # Firebase setup and services
├── /contexts          # Global state and context providers (if any)
```

---

## 🗃️ Firestore Structure

```
/batches (Collection)
  └── {batchId} (Document)
        ├── lectures: [ {title, link} ]
        ├── notes: [ {title, link} ]
        └── assignments: [ {title, link} ]

/notices (Collection)
  └── {noticeId} (Document)
        ├── title, message, timestamp
        └── attachment (file URL + type)
```
## 📧 Contact

```
For support, integration, or partnership queries:
📩 Email: rohitgiri28coding.com

```
🔹 Paatthya Educator App – Link. Assign. Educate.
Built to empower teachers, without the hassle of file uploads.
---


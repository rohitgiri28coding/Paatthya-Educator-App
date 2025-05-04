# Paatthya Educator App - Coaching Admin Panel

A comprehensive web application for coaching institutes to manage batches, learning materials, and notices.

## Features

### Authentication
- **User Authentication**: Secure login with email and password using Firebase Auth
- **Skip Feature**: Bypass authentication for development and testing purposes

### Batches Management
- **Dashboard**: View all batches with details including:
  - Title, image, price, and MRP
  - Limited-time-deal badge for promotional offers
- **Batch Operations**: Add new batches, update existing ones, or delete batches

### Learning Materials Management
Within each batch:
- **Lectures**: Add, edit, and remove lecture materials
- **Notes**: Manage study notes and resources
- **Assignments**: Track and distribute assignments

### Notice Board
- **Announcements**: View all notices sorted by latest timestamp
- **File Downloads**: Access attached files with visual indicators for file types
- **Status Tracking**: Shows download status for files

## Tech Stack

- **Frontend**: React, Tailwind CSS
- **Backend**: Firebase Firestore
- **Authentication**: Firebase Authentication
- **Build Tool**: Vite

## Setup Instructions

### Prerequisites

- Node.js and npm installed

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Configure Firebase:
   - Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password) and Firestore Database
   - Update the `firebaseConfig` in `src/firebase/firebase.js` with your project credentials

4. Start the development server:
   ```
   npm run dev
   ```

### Build for Production

```
npm run build
```

## Project Structure

- `/src`
  - `/components`: Reusable UI components
  - `/pages`: Application routes (Login, Dashboard, BatchDetails, Notices)
  - `/firebase`: Firebase configuration
  - `/contexts`: Context providers (if any)
  - `/assets`: Static assets

## Firestore Structure

- **batches**: Collection to store all batches
  - Each batch document contains arrays for lectures, notes, and assignments
- **notices**: Collection to store announcements and notices

## License

MIT 
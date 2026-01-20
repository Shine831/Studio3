# **App Name**: RéviseCamer

## Core Features:

- User Authentication: Secure authentication system supporting email/password, phone (OTP), and OAuth (Google). Includes profile creation with role assignment (student, tutor, admin) and identity verification for tutors (CV/ID upload, admin validation).
- Bilingual Educational Content: Centralized repository of structured courses and interactive quizzes for Cameroonian high school students in both English and French. Supports subjects, courses, lessons, quizzes, and questions stored in Firestore, categorized by level, stream, language, and program tags. Each lesson includes title, summary, HTML/Markdown content, resources (pdf/audio/video from Storage), and estimated time.
- Interactive Quiz Engine with Spaced Repetition: Versatile quiz engine with multiple question types (MCQ, True/False, short answer, matching), immediate feedback, detailed explanations, and automatic correction. Incorporates a spaced repetition system (SRS) algorithm for targeted review, enhancing knowledge retention. A Cloud Function will automatically update the SRS system based on performance.
- Personalized Learning Paths: Student dashboard tracks progress by subject, study time, average score, and course suggestions. Generates personalized study plans based on diagnostic pre-tests, and sends study reminders, tutoring session notifications and promotional updates via Firebase Cloud Messaging.
- Tutor Marketplace & Matching: Connects students with qualified tutors through profiles including subjects, levels, rates, availability, ratings, and session history. Utilizes a sophisticated tool to match tutors based on tags, availability, budget, and ratings, facilitating integrated booking, calendar management, confirmations, and reminders.
- In-App Communication & Secure Payment: Enables real-time chat between students and tutors using Firestore, with options for video calls. Facilitates secure payments via Stripe integration and hooks for local mobile money gateways (MTN/Orange Money) through Cloud Functions, offering both subscription and pay-per-session models.
- Admin & Moderation Dashboard: Admin interface for tutor validation, content management, comment moderation, and usage reporting. Provides tools for creating courses and quizzes, importing content, and exporting usage statistics in CSV format, ensuring quality control and platform integrity.

## Style Guidelines:

- Primary color: Deep indigo (#3F51B5), conveying trustworthiness, intelligence, and stability, which is crucial for an educational platform.
- Background color: Very light indigo (#E8EAF6), creating a calm and focused learning environment.
- Accent color: Blue (#5C6BC0), providing a vibrant but harmonious contrast to highlight important interactions and calls to action.
- Body font: 'Inter', sans-serif, for clear, modern readability in all text blocks.
- Headline font: 'Space Grotesk', sans-serif, for a clean, modern look for headers, menus and call-outs. Paired with 'Inter' for body text.
- Consistent use of simple, clear icons to represent subjects, features, and actions.
- Mobile-first, responsive design that adapts seamlessly to different screen sizes. Clean, intuitive layout that emphasizes content and minimizes distractions. The language switch shall be at the top.
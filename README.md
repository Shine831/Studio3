# RéviseCamer

RéviseCamer is a web application designed to help Cameroonian students succeed in their studies. It leverages AI to provide personalized study plans, detailed lessons, and interactive quizzes on demand.

## Features

- **AI-Powered Study Plans**: Describe your learning goals for any academic subject and receive a structured, actionable study plan.
- **On-Demand Lesson Generation**: For each topic in your study plan, generate comprehensive lesson content in Markdown format.
- **Interactive Quizzes**: Test your knowledge with multiple-choice quizzes generated for each lesson, complete with explanations for every answer.
- **Student Dashboard**: A central hub to track progress, view recent quiz scores, and see overall performance at a glance.
- **Bilingual Support**: The interface and generated content are available in both French and English.
- **Clean, Modern UI**: A responsive and intuitive user interface built with Next.js, React, and ShadCN UI.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **AI/Generative**: [Google Gemini](https://gemini.google.com/) via [Genkit](https://firebase.google.com/docs/genkit)
- **Database & Auth**: [Firebase](https://firebase.google.com/) (Firestore & Authentication)
- **Form Management**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)

## Getting Started

To run the project locally, you will need to set up your own Firebase project and configure the environment variables.

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd revise-camer
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
- Create a new project in the [Firebase Console](https://console.firebase.google.com/).
- In your project settings, add a new **Web App**.
- Copy the Firebase configuration object provided.
- Create a file named `.env.local` in the root of your project.
- Use the `.env.local.example` file as a template and populate `.env.local` with the values from your Firebase config.

Your `.env.local` file should look like this:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_APP_ID=1:1234...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABCD...
```

### 4. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

---

## Deployment with Vercel

Deploying this application to Vercel is straightforward.

1.  **Push to GitHub:** Make sure your code is pushed to a GitHub repository.

2.  **Import Project in Vercel:**
    - Sign up or log in to your [Vercel account](https://vercel.com).
    - From your dashboard, click "Add New..." -> "Project".
    - Import the GitHub repository for this project.

3.  **Configure Environment Variables:**
    - In the project settings on Vercel, navigate to the "Environment Variables" section.
    - Add all the `NEXT_PUBLIC_` variables from your `.env.local` file. This is a crucial step for your deployed app to connect to Firebase.

4.  **Deploy:**
    - Vercel will automatically detect that this is a Next.js project.
    - Click "Deploy". Your application will be built and deployed.

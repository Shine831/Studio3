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
- **Form Management**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Development Environment**: [Visual Studio Code](https://code.visualstudio.com/)

## Getting Started

Follow these steps to set up and run the project locally. It is recommended to use [Visual Studio Code](https://code.visualstudio.com/) as your code editor.

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd revise-camer
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result. The application requires certain environment variables to be set up to connect to its backend services. Please refer to `.env.local.example` for the required variables.

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
    - Add all the required variables listed in the `.env.local.example` file. This is a crucial step for your deployed app to connect to its backend services.

4.  **Deploy:**
    - Vercel will automatically detect that this is a Next.js project.
    - Click "Deploy". Your application will be built and deployed.

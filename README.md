# RéviseCamer

RéviseCamer is a web application designed to help Cameroonian students succeed in their studies. It leverages AI to provide personalized study plans, detailed lessons, and interactive quizzes on demand.

## Features

- **AI-Powered Study Plans**: Describe your learning goals for any academic subject and receive a structured, actionable study plan.
- **On-Demand Lesson Generation**: For each topic in your study plan, generate comprehensive lesson content in Markdown format.
- **Interactive Quizzes**: Test your knowledge with multiple-choice quizzes generated for each lesson, complete with explanations for every answer.
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

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd <repo-name>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Firebase:**
    - Create a new project in the [Firebase Console](https://console.firebase.google.com/).
    - Add a new Web App to your project.
    - Copy the Firebase configuration object and place it in a `.env.local` file or directly into the Firebase config file in the project.
    - Enable Firestore and Firebase Authentication (with Email/Password provider).

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

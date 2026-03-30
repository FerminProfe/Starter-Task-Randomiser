# Starter Task Randomiser

An AI-powered tool for teachers to generate engaging 10-minute starter activities for students (Year 7-13) based on uploaded lesson materials.

## Features
- **Year Group Selection:** Tailor tasks for students aged 11 to 18.
- **Multi-Format Upload:** Supports PDFs, images, and text files.
- **Custom Preferences:** Optional text box for teachers to specify activity types (e.g., "multiple choice quiz", "debate hook").
- **AI-Powered:** Uses Google Gemini 3 Flash for intelligent content analysis and task generation.

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- A Google Gemini API Key (get one at [ai.google.dev](https://ai.google.dev/))

### Installation
1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd starter-task-randomiser
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and add your API key:
   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment

### Vercel (Recommended for Free Hosting)
1. Push your code to a GitHub repository.
2. Connect your GitHub account to [Vercel](https://vercel.com/).
3. Import the project.
4. Add `VITE_GEMINI_API_KEY` as an Environment Variable in the Vercel dashboard.
5. Deploy! You will get a professional `.vercel.app` link to share with your colleagues.

### Netlify
Similar to Vercel, connect your GitHub repo to [Netlify](https://www.netlify.com/) and add the environment variable.

## Built With
- React + Vite
- Tailwind CSS
- Google Gemini AI SDK
- Lucide React (Icons)
- Framer Motion (Animations)

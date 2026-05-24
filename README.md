# Scholar Search - MVP

A full-stack web application to search and categorize academic research papers.

## Features
- Search papers by topic (OpenAlex & Semantic Scholar)
- Automatic classification (Review vs Research)
- Access detection (Open Access vs Subscription)
- Rich filters (Year, Type, Source, Access)
- MongoDB Caching for fast results
- Clean, modern UI with responsive design

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or on Atlas)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd scholar-search/backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env`:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/scholar_search
   OPENALEX_EMAIL=your_email@example.com
   SEMANTIC_SCHOLAR_API_KEY=
   ```
4. Start the server:
   ```bash
   npm run dev (or node index.js)
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd scholar-search/frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env.local` (optional):
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure
- `backend/`: Express server, API services, MongoDB models.
- `frontend/`: Next.js app, Tailwind CSS components, API utilities.

# GrammarBoost

An interactive grammar-learning platform with lesson management, quizzes, progress tracking, and an admin dashboard. Built as a monorepo with a **Next.js** frontend and an **Express** REST API backend.

---

## Tech Stack

| Layer       | Technology                                                          |
| ----------- | ------------------------------------------------------------------- |
| **Runtime** | Node.js **22.x** (enforced via `.nvmrc` & `engines`)                |
| **Client**  | Next.js 16 · React 19 · Tailwind CSS 4 · shadcn/ui · SWR · Recharts |
| **Server**  | Express 5 · Mongoose (MongoDB) · JWT auth (httpOnly cookies)        |
| **Storage** | Cloudflare R2 (lesson PDFs) · Cloudinary (images)                   |
| **Testing** | Jest · Supertest · mongodb-memory-server                            |
| **Deploy**  | Docker · Render                                                     |

---

## Architecture

```
grammarboost/                    ← monorepo root (npm workspaces)
├── client/                      ← Next.js frontend (static export)
│   ├── components/              ← Shared & UI components (shadcn/ui)
│   ├── hooks/                   ← Custom React hooks (useAuth, useMobile)
│   ├── lib/                     ← API client, utilities
│   ├── pages/                   ← Next.js pages (Pages Router)
│   │   ├── admin/               ← Admin dashboard (lessons, questions, tags)
│   │   ├── auth/                ← Login & Signup
│   │   ├── lessons/             ← Lesson list, detail, quiz
│   │   └── progress/            ← Progress dashboard, quiz attempts
│   └── styles/                  ← Global CSS / Tailwind config
├── server/                      ← Express API
│   ├── config/                  ← DB connection, env loader, Swagger
│   ├── controllers/             ← Route handlers
│   ├── middleware/               ← Auth, admin, error handling, logger
│   ├── models/                  ← Mongoose schemas
│   ├── routes/                  ← Express routers
│   ├── services/                ← Business logic (auth, quiz, R2, tokens)
│   ├── tests/                   ← Jest integration tests
│   └── utils/                   ← ApiError, slugify
├── Dockerfile                   ← Multi-stage Docker build
├── render.yaml                  ← Render deployment blueprint
└── package.json                 ← Workspace root
```

### Data Models

| Model            | Description                                   |
| ---------------- | --------------------------------------------- |
| `User`           | Accounts with `role` (learner / admin)        |
| `Lesson`         | Grammar lessons with tags, slugs, PDF content |
| `Question`       | Multiple-choice & fill-in-the-blank questions |
| `Tag`            | Categorization tags for lessons               |
| `QuizAttempt`    | Recorded quiz submissions with scores         |
| `LessonProgress` | Per-user lesson completion tracking           |
| `RefreshToken`   | Hashed refresh tokens for secure rotation     |

### API Routes

| Route             | Description                              |
| ----------------- | ---------------------------------------- |
| `GET /api/health` | Health check                             |
| `/api/auth`       | Register, login, refresh, logout         |
| `/api/lessons`    | CRUD lessons (admin), list/view (public) |
| `/api/questions`  | CRUD quiz questions (admin)              |
| `/api/tags`       | CRUD tags (admin)                        |
| `/api/progress`   | User progress & quiz attempts            |
| `/api/docs`       | Interactive Swagger UI                   |
| `/api/docs-yaml`  | OpenAPI schema in YAML                   |

---

## Prerequisites

- **Node.js 22.x** — use [nvm](https://github.com/nvm-sh/nvm) for version management
- **MongoDB** — local instance or [MongoDB Atlas](https://www.mongodb.com/atlas)
- **Cloudflare R2** account (for lesson PDF storage)
- **Cloudinary** account (optional, for image uploads)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/grammarboost.git
cd grammarboost
```

### 2. Set Node.js version

```bash
nvm use
# Now using node v22.x
```

> The `.nvmrc` file in the project root pins Node.js to **v22**.

### 3. Install dependencies

All dependencies are installed from the **project root** via npm workspaces:

```bash
npm install
```

This installs packages for both `client/` and `server/` workspaces.

### 4. Configure environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

#### `.env.example`

```env
PORT=3001
MONGODB_URI=
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=grammarboost
R2_PUBLIC_BASE_URL=
R2_ENDPOINT=
```

| Variable                | Required | Description                                   |
| ----------------------- | -------- | --------------------------------------------- |
| `PORT`                  | Yes      | Backend server port (default: `3001`)         |
| `MONGODB_URI`           | Yes      | MongoDB connection string                     |
| `ACCESS_TOKEN_SECRET`   | Yes      | JWT secret for access tokens                  |
| `REFRESH_TOKEN_SECRET`  | Yes      | JWT secret for refresh tokens                 |
| `CLOUDINARY_CLOUD_NAME` | No       | Cloudinary cloud name (for image uploads)     |
| `CLOUDINARY_API_KEY`    | No       | Cloudinary API key                            |
| `CLOUDINARY_API_SECRET` | No       | Cloudinary API secret                         |
| `R2_ACCOUNT_ID`         | Yes      | Cloudflare account ID                         |
| `R2_ACCESS_KEY_ID`      | Yes      | R2 access key                                 |
| `R2_SECRET_ACCESS_KEY`  | Yes      | R2 secret key                                 |
| `R2_BUCKET`             | Yes      | R2 bucket name (default: `grammarboost`)      |
| `R2_PUBLIC_BASE_URL`    | Yes      | Public URL for R2 bucket (e.g. custom domain) |
| `R2_ENDPOINT`           | Yes      | R2 S3-compatible endpoint URL                 |

### 5. Run the development servers

From the **project root**, run both servers concurrently:

```bash
# Terminal 1 — Backend (Express API with nodemon)
npm run back

# Terminal 2 — Frontend (Next.js dev server)
npm run front
```

| Service  | URL                            |
| -------- | ------------------------------ |
| Frontend | http://localhost:3000          |
| Backend  | http://localhost:3001          |
| API Docs | http://localhost:3001/api/docs |

---

## Testing

Tests use **Jest** + **Supertest** with an in-memory MongoDB instance:

```bash
# Run all server tests
npm run test --workspace=server
```

Test files are located in `server/tests/` and cover:

- **Auth routes** — registration, login, token refresh
- **Lesson routes** — CRUD operations, content link validation
- **Tag routes** — admin tag management
- **Quiz service** — answer scoring logic

---

## Docker

The project includes a multi-stage Dockerfile:

```bash
# Build the image
docker build -t grammarboost .

# Run the container
docker run -p 4000:4000 --env-file .env grammarboost
```

The Docker build:

1. Installs all dependencies and builds the Next.js static export
2. Creates a slim production image with only server dependencies
3. Serves the static frontend from Express at port **4000**

---

## Deployment (Render)

The project includes a `render.yaml` blueprint for one-click deployment:

- **Service type**: Web (Docker)
- **Region**: Frankfurt
- **Health check**: `GET /api/health`
- **Required env vars**: `MONGO_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`

---

## Available Scripts

Run all scripts from the **project root**:

| Script          | Description                        |
| --------------- | ---------------------------------- |
| `npm run front` | Start Next.js dev server           |
| `npm run back`  | Start Express dev server (nodemon) |
| `npm run build` | Build Next.js for production       |
| `npm run start` | Start Next.js production server    |
| `npm run lint`  | Run ESLint on the client           |

---

## Key Directories

| Path                    | Purpose                                     |
| ----------------------- | ------------------------------------------- |
| `client/components/ui/` | 60+ shadcn/ui primitives (Button, Dialog…)  |
| `client/hooks/`         | `useAuth` (SWR-based), `useIsMobile`        |
| `client/lib/api.js`     | Axios instance with auto token refresh      |
| `server/services/`      | Business logic layer (auth, quiz, R2, etc.) |
| `server/middleware/`    | Auth guards, error handler, request logger  |
| `server/swagger.yaml`   | Full OpenAPI 3.0 specification              |

---

## Contributing

1. Create a feature branch from `main`
2. Always add/update **tests** when functionality changes
3. Update **JSDoc / @openapi comments** when API endpoints change
4. Keep **Swagger definitions** in `server/config/swagger.js` in sync with model changes
5. Run `npm run lint` and `npm run test --workspace=server` before committing

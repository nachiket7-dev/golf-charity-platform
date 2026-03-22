# Golf Charity Subscription Platform

A full-stack MERN subscription platform combining golf performance tracking, monthly prize draws, and charitable giving.

Built for Digital Heroes — Full-Stack Trainee Selection Process.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB (Mongoose ODM) |
| Payments | Mock Checkout / Simulated Payment Gateway |
| Auth | JWT (JSON Web Tokens) |
| CI/CD | GitHub Actions (Automated Tests) + Dependabot |
| Deploy | Vercel (frontend) + Render/Railway (backend) + MongoDB Atlas |

---

## Project Structure

```text
golf-charity-platform/
├── .github/             # CI Workflows & Dependabot
├── backend/
│   ├── config/          # DB connection
│   ├── controllers/     # Route logic
│   ├── middleware/      # Auth guards
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routers
│   ├── server.js        # Entry point
│   └── .env             # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # React context (Auth)
│   │   ├── pages/       # Route pages
│   │   └── utils/       # Axios instance
│   └── vite.config.js
└── install.sh           # Global installation script
```

---

## Setup Instructions

### 1. Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier works)

### 2. Global Installation

You can install all dependencies for both the frontend and backend using the provided script:

```bash
chmod +x install.sh
./install.sh
```

### 3. Backend Setup

Create a `.env` file inside the `backend/` directory with the following variables:

```env
PORT=3000
MONGODB_URI=mongodb+srv://...         # MongoDB Atlas connection string
JWT_SECRET=your_32_char_secret_here
CLIENT_URL=http://localhost:5173
NODE_ENV=development

# Subscription Prices (in cents/paise)
MONTHLY_PLAN_AMOUNT=1999
YEARLY_PLAN_AMOUNT=19999
CHARITY_MIN_PERCENT=10

# Mock Payments
MOCK_PAYMENTS=true                    # Native simulated payment gateway
```

Start the backend:
```bash
cd backend
npm run dev
```

### 4. Frontend Setup

Create a `.env` file inside the `frontend/` directory:

```env
VITE_API_URL=http://localhost:3000/api
```

Start the frontend:
```bash
cd frontend
npm run dev
```

---

## API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Scores
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/scores` | ✅ | Get user's scores |
| POST | `/api/scores` | ✅ Subscriber | Add score (rolling 5) |
| PUT | `/api/scores/:id` | ✅ Subscriber | Edit score |
| DELETE | `/api/scores/:id` | ✅ Subscriber | Remove score |

### Subscriptions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/subscriptions/create-checkout` | Start Mock checkout session |
| POST | `/api/subscriptions/cancel` | Cancel at period end |
| GET | `/api/subscriptions/status` | Get subscription status |
| POST | `/api/subscriptions/mock-complete` | Complete mock payment |

### Draws
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/draws` | All published draws |
| GET | `/api/draws/latest` | Most recent draw |
| POST | `/api/draws/simulate` | Admin: simulate draw |
| POST | `/api/draws/:id/publish` | Admin: publish winners |

---

## Draw System Logic

### Score Entry
- Users enter Stableford scores (range 1–45)
- Maximum 5 scores stored at any time
- Adding a 6th score automatically removes the **oldest** score
- Scores stored with date played and displayed newest-first
- User needs exactly 5 scores to be eligible for the draw

### Draw Engine
- **Random mode**: 5 unique numbers drawn from 1–45 (standard lottery)
- **Algorithmic mode**: Weighted random selection based on frequency of scores across all active eligible users (more common scores = higher probability)
- Admin simulates first → reviews → publishes

### Prize Pool Distribution
| Match | Pool Share | Jackpot Rollover |
|-------|-----------|-----------------|
| 5 numbers | 40% | ✅ Yes |
| 4 numbers | 35% | ❌ No |
| 3 numbers | 25% | ❌ No |

- Pool funded by subscription fees (minus charity contributions)
- Jackpot rolls over to next month if no 5-match winner
- Multiple winners in same tier split the prize equally

### Charity Contributions
- Minimum 10% of subscription fee goes to selected charity
- User can increase percentage up to 100%
- Rest goes to prize pool

---

## Deployment

### Frontend → Vercel, Netlify, or Cloudflare Pages
1. Connect your GitHub repository.
2. Set the root directory to `frontend`.
3. Add `VITE_API_URL=https://your-production-backend.com/api` to environment variables.
4. Deploy.

### Backend → Render, Railway, or Heroku
1. Connect your GitHub repository and point the Build Command to the `backend` folder (`cd backend && npm install`).
2. Point the Start Command to `npm start` (or `node server.js`).
3. Add all `backend/.env` variables to the host's robust environment variables settings.
4. Ensure `CLIENT_URL` matches your deployed frontend URL exactly (for CORS).

### Database → MongoDB Atlas
Ensure your Network Access IP Whitelist includes `0.0.0.0/0` (Allow Access from Anywhere) so your dynamic backend hosts can connect.

---

*Built with ❤️ for Digital Heroes — digitalheroes.co.in*
# golf-charity-platform

# Pennywise

> **Know your money. Plan your month.**  
> High Performance · Student-focused Personal Finance · INR (₹) Precision

Pennywise is a student-first personal finance tracker built on a high-performance modern web stack with enterprise-grade security and automotive-inspired telemetry. Designed for the real financial lives of students: hostel canteens, tea & snacks, book xeroxing, project materials, college semester fee milestones, and monthly fuel/budget ceilings.

---

## 🎨 Visual Identity & Mobile Design

- **Cockpit Dashboard**: Sleek dark automotive aesthetic (`#0D1117` carbon background, `#161B22` cards, `#E11D48` racing red accents) paired with a clean `#FFFFFF` data surface.
- **Modern Floating Bottom Dock**: Glassmorphic blur (`backdrop-filter: blur(20px)`), active tab indicators, and an elevated crimson Floating Action Button (`+` FAB) for 1-tap pit stop logging.
- **Touch Ergonomics & Safe Scrolling**: Full-screen responsive layouts, single-column adaptive metric cards, and horizontal table scrolling with 110px safe bottom padding.
- **Paise Precision Accounting**: Monetary records are computed and stored as integer paise (e.g. ₹50.25 = 5025 paise) to eliminate floating-point rounding errors.

---

## 🚀 Key Features

### 1. Cockpit Overview (Dashboard)
- **Live Account Balance**: Real-time balance derived from actual cash/bank account ledgers.
- **Inflow / Burn Rate Telemetry**: Fuel inflow and monthly burn rate metrics with high-contrast color indicators.
- **Tachometer / Fuel Tank Budget**: Configurable monthly expense ceiling with visual progress bars and warnings when exceeding 80%.
- **Academy Track Obligations**: Instant glance at semester spending & upcoming fee dues.
- **Recent Pit Stop Logs**: Categorized transaction stream with timestamps and payment method badges.

### 2. Pit Stop Logging & Smart Categorization
- Quick modal for recording expenses, income, and fee installments.
- **Payment Method Badges**: Explicit tagging for **UPI**, **Cash**, and **Card**.
- **Student-Tailored Items**:
  - *Tea & Coffee*: Tea with snacks, Tea without snacks, Coffee with snacks, Coffee without snacks
  - *Meals & Main Dishes*: Mandi, Biriyani, Meals, Parotta, Shawarma
  - *Snacks & Drinks*: Puff, Samosa, Cutlet, Lime, Juice, Soft drinks
- Search, filter by category/type, sort by date/amount, and pagination.

### 3. Academy Track & Fee Obligation Tracker
- Separate tab for education spending:
  - College Tuition, Photocopy & Printing, Textbooks, Pens & Stationery, Lab Supplies, Project Materials.
- **Fee Obligations vs. Actual Payments**:
  - Semester obligations remain dues without falsely reducing cash balances before payment.
  - Supports **installments**: Recording an installment updates obligation status (*unpaid*, *partially_paid*, *paid*) and creates an isolated expense transaction without double counting.

### 4. Monthly Spending Plan (Goals)
- Set and adjust limits for any month.
- **1-Tap Quick Presets**: Instant budget chips for student budgets (`₹3,000`, `₹5,000`, `₹8,000`, `₹12,000`).
- Multi-segment progress bar with dynamic warning and exceed states.

### 5. Native Mobile Profile
- Grouped iOS/Android native-style settings cells.
- Account Details: Full Name, Email, College/University, and Default Currency (₹ INR).
- Single-click database wipe to reset demo records and start fresh with a ₹0 balance.

---

## 🔒 Four-Layer Defense-in-Depth Security

PennyWise enforces independent security controls across four architectural tiers:

1. **Layer 1: Network & Perimeter Security**:
   - `helmet` security headers with strict **HSTS** (`maxAge: 31536000`, `includeSubDomains`, `preload`).
   - Explicit **CORS** origin allowlisting (`CLIENT_URL`, `http://localhost:5173`).
   - Multi-tier rate limiting: 300 req/15min for general API, strict 30 req/15min on authentication routes to block brute-force attacks.
   - Request body payload capped at `1mb` to prevent Denial-of-Service (DoS).
2. **Layer 2: Authentication & Authorization**:
   - `bcrypt` one-way password hashing ($cost = 10$) with timing-safe comparison.
   - Stateless JWT tokens signed with server-validated secrets.
   - Server-enforced record ownership (`ownerId: req.user._id`) on all CRUD queries to prevent IDOR.
   - Ambiguous authentication error messages to prevent account enumeration.
3. **Layer 3: Input Validation & NoSQL Injection Defense**:
   - Centralized recursive sanitizer (`noSqlSanitizer.js`) scanning `req.body`, `req.query`, and `req.params`.
   - Blocks MongoDB query selector injection (`$gt`, `$ne`, `$where`, `$regex`) and prohibited dot-notation property overwriting.
4. **Layer 4: Database & Secrets Protection**:
   - Connection strings and secrets remain strictly in `backend/.env`.
   - Projections omit sensitive password fields (`select: false`).
   - Centralized Express error handler masks database internals and stack traces in production.

---

## 📁 Monorepo Project Architecture

```
Finance/
├── frontend/
│   ├── public/                  # Manifest, icons, sports-car assets
│   ├── src/
│   │   ├── components/          # Reusable UI & Floating Bottom Dock
│   │   ├── context/             # AuthContext with instant session caching
│   │   ├── pages/               # Cockpit, Pit Stops, Academy, Goals, Profile, Auth
│   │   ├── services/            # Centralized Axios HTTP client
│   │   ├── styles/              # Design tokens & responsive styles
│   │   ├── App.jsx              # Routes & ProtectedLayout
│   │   └── main.jsx
│   ├── packages/
│   │   ├── api-services/        # Centralized endpoint URLs & domain services
│   │   └── shared-utils/        # Integer paise & currency helpers
│   ├── .env.example
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── app.js               # Express app with 4-layer security middleware
│   │   ├── server.js            # Server entry point & DB connection lifecycle
│   │   ├── config/              # Validated environment configuration (env.js, db.js)
│   │   ├── controllers/         # Lightweight route handlers
│   │   ├── errors/              # Centralized AppError classes
│   │   ├── middleware/          # Auth, NoSQL injection sanitizer, Helmet, Rate Limiter
│   │   ├── models/              # User, Account, Transaction, AcademicFee, MonthlyBudget
│   │   ├── repositories/        # Isolated Mongoose data-access layer
│   │   └── routes/              # REST API route definitions
│   ├── tests/
│   │   ├── security/            # Automated NoSQL injection & bcrypt verification tests
│   │   └── backend.test.js      # Integration & isolation tests
│   ├── .env                     # Server environment variables (Git-ignored)
│   ├── .env.example
│   └── package.json
│
├── package.json                 # Root workspace orchestrator
└── README.md
```

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **MongoDB** (Local instance or MongoDB Atlas cluster)

### Environment Configuration

1. **Backend Environment** (`backend/.env`):
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/pennywise?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key_here
   CLIENT_URL=http://localhost:5173
   NODE_ENV=development
   ```

2. **Frontend Environment** (`frontend/.env`):
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

---

### Running the Application

You can run both services independently or together:

#### Option A: Run Separately (Recommended)

1. **Start Backend**:
   ```bash
   cd backend
   npm run dev
   ```
   *Runs at `http://localhost:5000` with live auto-reload.*

2. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
   *Runs at `http://localhost:5173`.*

---

### Automated Security & Build Verification

- **Run NoSQL Injection & Security Tests**:
  ```bash
  npm run test:security
  ```
- **Build Frontend Production Bundle**:
  ```bash
  npm run build:frontend
  ```

---

## 📄 License
ISC © PennyWise Finance

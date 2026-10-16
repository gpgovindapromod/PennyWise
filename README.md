# Pennywise

> **Know your money. Plan your month.**
> Personal finance · Student-focused · INR (₹)

Pennywise is a student-first personal finance tracker crafted with a clean, human-designed aesthetic (warm burgundy, orange, baby pink, cream, and chocolate on clean white). Built specifically for real student financial lives: hostel canteens, tea & snacks, book xeroxing, project components, college fee installments, and monthly budget limits.

---

## 🎨 Visual Identity & Design Principles

- **Canvas**: Clean white background (#FFFFFF) as default with soft neutral borders (#F7F4F2).
- **Brand Burgundy** (#7A263A): Primary actions, branding, key headers, and active navigation.
- **Warm Orange** (#E98543): Spending alerts (>=80% budget limit) and quick actions.
- **Baby Pink** (#F4CFD5): Subtle accents, selected category tags, and pill highlights.
- **Cream** (#FFF3E3): Goal cards, fee cards, and gentle section backgrounds.
- **Chocolate** (#563B32): High-contrast readable typography and icons.
- **Income Green** (#3F7655) & **Expense Red** (#B74740): Unambiguous financial indicators.
- **Precision**: Money stored and computed as integer paise (e.g. ₹50.00 = 5000 paise) to eliminate floating-point rounding errors.

---

## 🚀 Key Features

### 1. Dashboard — Financial Command Center
- **Current Balance**: Real-time balance derived from actual cash/bank account ledgers (not confused with monthly cash flow).
- **Monthly Income & Expenses**: Clean tracking of all inflows and outflows for the current month.
- **Monthly Spending Goal**: Configurable spending limit with live visual progress bar, remaining allowance, and warnings when crossing 80%.
- **Academic Spending Capsule**: Instant glance at semester spending & upcoming fee dues.
- **Recent Activity**: Categorized transaction stream with specific icons and timestamps.

### 2. Smart Expense Tracking with Student-Tailored Items
- Quick modal for adding income, expenses, and refunds.
- **Food & Drinks Dependent Item Selector**:
  - *Tea & Coffee*: Tea with snacks, Tea without snacks, Coffee with snacks, Coffee without snacks
  - *Meals & Main Dishes*: Mandi, Biriyani, Meals, Parotta, Shawarma
  - *Snacks & Drinks*: Puff, Samosa, Cutlet, Lime, Juice, Soft drinks
- Search, filter by category/type, sort by date/amount, and full pagination.

### 3. Dedicated Academic Expenses & Fee Obligation Tracker
- Separate tab for education spending:
  - College Fees, Photocopy & Printing, Textbooks, Pens & Stationery, Lab Supplies & Components, Project Materials, Calculator & Instruments.
- **Fee Obligations vs. Actual Payments**:
  - Fees due (e.g. ₹20,000 semester tuition) remain obligations without falsely reducing cash balance before payment.
  - Supports **installments**: Recording an installment automatically updates the fee obligation status (*unpaid*, *partially_paid*, *paid*) and creates a linked expense transaction without double counting.

### 4. Monthly Spending Goals
- Set and adjust limits for any month.
- Automatic rollover handling; historical budgets are preserved.
- Real-time warnings when budget usage passes 80% or exceeds 100%.

### 5. Visual Reports & Analytics
- 6-month Income vs. Expense monthly bar charts.
- Spending distribution by category.
- Detailed Food & Drinks item breakdown (see how much is spent on tea, mandi, biriyani, snacks).
- Academic breakdown (fees vs photocopy vs books vs supplies).

### 6. Profile & Settings
- Indian Rupee (INR ₹) formatting.
- Manage default accounts (Cash in hand, Bank account, UPI/Wallet).
- Single-click database demo seeder to explore realistic student transactions.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, React Router 6, Recharts, Lucide Icons, Vanilla CSS variables.
- **Backend**: Node.js, Express, Mongoose (MongoDB ODM), JWT authentication, bcryptjs password hashing.
- **Database**: MongoDB (local or MongoDB Atlas).

---

## 📁 Project Structure

`
Finance/
├── client/                     # React + Vite Frontend
│   ├── src/
│   │   ├── components/         # Navbar, Modals, TransactionRow, StatCard
│   │   ├── pages/
│   │   │   ├── Dashboard/      # Main financial overview
│   │   │   ├── Transactions/   # All transactions with filters & search
│   │   │   ├── Academics/      # Fee obligations & study materials
│   │   │   ├── Goals/          # Monthly budget limits
│   │   │   ├── Reports/        # Visual charts & item breakdowns
│   │   │   ├── Settings/       # User preferences & account management
│   │   │   └── Auth/           # Login & Registration
│   │   ├── services/           # API clients (Axios)
│   │   ├── styles/             # Design system & CSS tokens
│   │   ├── App.jsx             # Routes & layout
│   │   └── main.jsx
│   └── package.json
├── server/                     # Node.js + Express Backend
│   ├── src/
│   │   ├── config/             # DB connection (MongoDB)
│   │   ├── controllers/        # Auth, Dashboard, Transactions, Academics, Budgets, Reports
│   │   ├── middleware/         # JWT auth protection
│   │   ├── models/             # User, Account, Transaction, MonthlyBudget, AcademicFee
│   │   ├── routes/             # REST API routes
│   │   ├── utils/              # Student categories & initial seeder
│   │   └── index.js            # Express server entry point
│   ├── .env                    # Environment config
│   └── package.json
├── package.json                # Monorepo scripts (concurrently)
└── README.md
`

---

## ⚡ Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ installed.
- **MongoDB** running locally on mongodb://127.0.0.1:27017 or a MongoDB Atlas URI.

### 2. Installation

Install all dependencies in root, server, and client:

`ash
# In the project root (Finance/)
npm install
npm --prefix server install
npm --prefix client install
`

### 3. Configure Environment

The server comes with preconfigured default .env in server/.env:
`env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/pennywise
JWT_SECRET=pennywise_student_secret_key_2026_jwt_token
CLIENT_URL=http://localhost:5173
`

### 4. Running the Application

You can start both backend and frontend simultaneously with a single command from root:

`ash
npm run dev
`
npm run dev:client
npm run dev:server

- Frontend runs at: http://localhost:5173
- Backend API runs at: http://localhost:5000

---

## 🔒 Security & Data Integrity

- **Isolated User Financed Records**: All queries derive ownerId strictly from verified JWT tokens.
- **No Double Counting**: Academic fee installments link directly to financial transactions.
- **Paise Precision**: Avoids floating-point math issues by storing integer paise internally.

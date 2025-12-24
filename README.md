<div align="center">
  
# 🌿 FinoraX

### **Smart Financial Management Platform**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Payments-0A67C2?style=for-the-badge&logo=razorpay&logoColor=white)](https://razorpay.com/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

**A full-stack subscription-based SaaS platform for personal finance management with multi-currency tracking, AI insights, and auto-recurring billing.**

[Live Demo](https://finorax.vercel.app) · [Report Bug](https://github.com/nvk170405/finora/issues) · [Request Feature](https://github.com/nvk170405/finora/issues)

</div>

---

## ✨ Features

### � Authentication & Security
- **Supabase Auth** with email/password and OAuth (Google, Apple, Meta)
- Magic link verification with branded email templates
- Row Level Security (RLS) for data isolation
- JWT-based access with automatic policy checks

### � Financial Management
- **Multi-Currency Wallets** with live exchange rates
- **Transaction Tracking** with categories and visual timeline
- **Spending Analytics** with charts and insights
- **Email Notifications** for transactions, goals, and bills

### ✨ Subscription Billing
- **Razorpay Auto-Recurring Subscriptions** (Monthly/Yearly)
- Basic & Premium tiers with feature gating
- Plan upgrades/downgrades with prorated billing
- Subscription management UI with cancel option
- Webhook handling for auto-renewal events

### 👑 Premium Features
- AI-powered spending insights
- Custom reports and analytics
- Priority support
- Multi-account management

### 🌗 Modern UI/UX
- Dark/Light theme with system preference detection
- Glassmorphism design with smooth animations
- Responsive layout for all devices
- Framer Motion animations

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + Vite + TypeScript |
| **Backend** | Supabase (PostgreSQL + Auth + Edge Functions) |
| **Payments** | Razorpay Subscriptions API |
| **Email** | Gmail SMTP via Supabase Edge Functions |
| **Styling** | Tailwind CSS + Custom Design System |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |

---

## 📁 Project Structure

```
finora/
├── src/
│   ├── components/      # Reusable UI components
│   ├── contexts/        # Auth, Subscription, Wallet, Preferences
│   ├── pages/           # Route pages (Login, Signup, Dashboard)
│   ├── services/        # API services (wallet, transactions, email)
│   ├── hooks/           # Custom hooks (useRazorpay)
│   ├── config/          # Supabase client configuration
│   └── App.tsx          # Root component with routing
│
├── supabase/
│   └── functions/       # Edge Functions
│       ├── create-razorpay-order/    # Create subscription
│       ├── verify-razorpay-payment/  # Verify payment
│       ├── update-subscription/      # Upgrade/downgrade
│       ├── cancel-subscription/      # Cancel subscription
│       ├── razorpay-webhook/         # Handle auto-renewals
│       └── send-email/               # Email notifications
│
└── public/              # Static assets
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- Razorpay account

### Installation

```bash
# Clone the repository
git clone https://github.com/nvk170405/finora.git
cd finora

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase and Razorpay credentials

# Run development server
npm run dev
```

### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx
```

### Supabase Secrets (Edge Functions)

```bash
supabase secrets set RAZORPAY_KEY_ID=rzp_test_xxxxx
supabase secrets set RAZORPAY_KEY_SECRET=your_secret_key
supabase secrets set RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
supabase secrets set RAZORPAY_PLAN_BASIC_MONTHLY=plan_xxxxx
supabase secrets set RAZORPAY_PLAN_BASIC_YEARLY=plan_xxxxx
supabase secrets set RAZORPAY_PLAN_PREMIUM_MONTHLY=plan_xxxxx
supabase secrets set RAZORPAY_PLAN_PREMIUM_YEARLY=plan_xxxxx
supabase secrets set GMAIL_USER=your_email@gmail.com
supabase secrets set GMAIL_APP_PASSWORD=your_app_password
```

---

## 📧 Email Notifications

| Email Type | Trigger |
|------------|---------|
| Welcome | On signup |
| Transaction Confirmation | On deposit/withdrawal |
| Subscription Confirmed | On successful subscription |
| Goal Reached | When savings goal is met |
| Bill Due Reminder | Before bill due date |

---

## 💳 Subscription Plans

| Feature | Basic | Premium |
|---------|-------|---------|
| Multi-currency wallets | Up to 5 | Unlimited |
| Analytics | Basic | Advanced + AI |
| Support | Standard | Priority |
| API Access | ❌ | ✅ |
| Custom Reports | ❌ | ✅ |

**Billing:** Monthly or Yearly with auto-renewal via Razorpay

---

## 🛡️ Security

- **Row Level Security (RLS)** enforced on all tables
- **JWT-based authentication** with Supabase
- **Webhook signature verification** for payment events
- **User data isolation** — no public data exposure
- **Secrets stored securely** in Supabase vault

---

## 🛣️ Roadmap

- [ ] PWA for offline mode
- [ ] AI voice journaling & mood analysis
- [ ] Notion & Google Calendar integration
- [ ] Admin dashboard for analytics
- [ ] Mobile apps (React Native)

---

## 👨‍💻 Author

<div align="center">
  
**Built with 💚 by Navketan Singh**

[![Twitter](https://img.shields.io/badge/Twitter-@singh__navk42168-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/singh_navk42168)
[![GitHub](https://img.shields.io/badge/GitHub-nvk170405-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/nvk170405)

</div>

---

<div align="center">
  
**⭐ Star this repo if you found it helpful!**

</div>

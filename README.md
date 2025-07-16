# 🌿 FinoraX — Modern Finance Tracker & Subscription-Based SaaS App

FinoraX is a full-stack subscription-based SaaS application that helps users track multiple currencies, visualize spending insights, and manage subscriptions securely — built with cutting-edge tools like React, Vite, Supabase, Paddle, and Tailwind CSS.

---

## 🚀 Features

### 🧑‍💻 Authentication
- Email/password login with Supabase Auth
- OAuth support: Google, Apple, Meta (Facebook)
- Magic link verification
- Automatic user creation in Supabase database

### 💳 Subscription Management
- Paddle Billing integration (Basic + Premium tiers)
- Plan enforcement via Supabase and custom feature gating
- Subscription status and billing cycle stored in Supabase

### 📊 Dashboard Components
- **Wallet Overview**: Multi-currency balance and live exchange rates
- **Transaction Timeline**: Visual breakdown of all user activity
- **Insights Page**: Spending analysis and mood tracking (AI-ready)
- **Profile & Settings**: Secure user controls

### 🔐 Access Control
- Protected routes with React Router
- Role-based feature gating via `SubscriptionGate`
- Supabase RLS (Row Level Security) for user-specific data protection

### 🌗 UI & Theming
- Built with Tailwind CSS + ShadCN UI
- Custom dark/light modes and premium themes
- Glassmorphism + Lucide icons for a modern look
- Responsive design with smooth animations (Framer Motion)

---

## 🛠️ Tech Stack

| Layer          | Tech Stack                        |
| -------------- | --------------------------------- |
| Frontend       | React + Vite + TypeScript         |
| Backend/Auth   | Supabase (DB + Auth + Storage)    |
| Payments       | Paddle Billing API                |
| Styling        | Tailwind CSS + ShadCN + Lucide    |
| Animations     | Framer Motion                     |
| Deployment     | Vercel / Netlify (optional)       |

---

## 📁 Folder Structure

/src
│
├── components/ # Reusable UI components
├── contexts/ # Auth and Subscription context providers
├── config/ # Utility functions (e.g. Supabase client)
├── pages/ # Route pages like login, signup, dashboard
├── assets/ # Static assets
├── index.css/ # Tailwind/global styles
├── App.tsx # Root component
└── main.tsx # Vite entry point

🛡️ Security Notes
├── Row Level Security (RLS) is enforced in Supabase for tables like users, subscriptions, transactions.

├── JWT-based access with automatic policy checks.

├── User data is isolated and never exposed publicly.


💡 Future Improvements
├── PWA for offline mode

├── AI voice journaling & mood analysis

├── Notion & Google Calendar integration

├── Admin dashboard for user insights

├── Analytics + Heatmaps

🧑‍🎓 Author
Built by Navketan Singh 🚀
Let’s connect on Twitter: @singh_navk42168
Have questions or feedback? Open an issue or DM me!

⭐️ Show your support
If you liked this project, consider starring it ⭐️
or sharing it with your friends who are building SaaS apps 💬

# Muhammad Ahmad — Developer Portfolio

A modern, high-performance developer portfolio built with **Next.js 16**, **React 19**, and **Tailwind CSS 4**. Designed with fluid animations, interactive visual components, and direct email delivery for the contact form via **Web3Forms**.

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?style=flat&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.2-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Deployed on Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=flat&logo=vercel)](https://vercel.com/)

---

## ✨ Features

- **Blazing Fast Performance**: Next.js 16 App Router with static generation and minimal bundle size.
- **Interactive Particle Sculpture**: Custom interactive canvas sculpture with pause/play controls.
- **Project Showcase**: Filterable and detailed showcase for enterprise & full-stack projects.
- **Zero-Backend Email Delivery**: Contact form messages are delivered directly to email using Web3Forms with built-in spam protection (honeypot).
- **Fully Responsive & Accessible**: Thoughtful typography, smooth scrolling, keyboard navigation, and mobile menu.
- **Easy Customization**: All portfolio data (bio, skills, projects, experience, education) is centralized in a single configuration file (`lib/content.ts`).

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack / Webpack)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) + Custom CSS
- **Icons**: [Lucide React](https://lucide.dev/)
- **Type Safety**: [TypeScript 5](https://www.typescriptlang.org/) & [Zod](https://zod.dev/)
- **Contact Service**: [Web3Forms](https://web3forms.com/)
- **Hosting Target**: [Vercel](https://vercel.com/)

---

## 📁 Project Structure

```text
portfolio-vercel/
├── app/
│   ├── api/
│   │   └── contact/route.ts      # Contact form API endpoint (Web3Forms email delivery)
│   ├── globals.css              # Global styles & Tailwind configuration
│   ├── layout.tsx               # Root application layout
│   ├── page.tsx                 # Main entry page (SSR / Static)
│   ├── portfolio.css            # Component-level styling & animations
│   └── portfolio.tsx            # Main interactive portfolio client component
├── components/
│   ├── portfolio/               # UI sections (Hero, Projects, Contact, Canvas sculpture)
│   └── ui/                      # Reusable UI primitives (Buttons, Inputs, Dialogs)
├── lib/
│   ├── content.ts               # Central profile, projects, skills & career data
│   └── utils.ts                 # Utility helper functions
├── public/                      # Static assets & SVGs
├── package.json
└── README.md
```

---

## 🚀 Getting Started Locally

### Prerequisites

- Node.js 20.x or 22.x+
- npm, pnpm, or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ahmed4849/nextjs-portfolio.git
   cd nextjs-portfolio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📝 How to Update Content

You do not need to modify component code to update your details. Simply open `lib/content.ts`:

- **Profile**: Change name, role, headline, bio, email, GitHub, LinkedIn, and availability status in `defaultProfile`.
- **Experience & Education**: Update career milestones, degrees, certifications, and location in `background`.
- **Projects**: Add, remove, or edit your projects in `sampleProjects`.

---

## 🌐 Deploying to Vercel

1. Push this repository to your GitHub account.
2. Go to [Vercel Dashboard](https://vercel.com/new).
3. Import the `nextjs-portfolio` repository.
4. Leave all build settings at their defaults:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. Click **Deploy**. No additional environment variables are required!

---

## 📬 Contact & Connect

- **Developer**: Muhammad Ahmad
- **Role**: .NET Full Stack Developer
- **Email**: [ahmed.asif4849@gmail.com](mailto:ahmed.asif4849@gmail.com)
- **LinkedIn**: [linkedin.com/in/m-ahmed-4849as](https://www.linkedin.com/in/m-ahmed-4849as)
- **GitHub**: [github.com/ahmed4849](https://github.com/ahmed4849)

---

Crafted with intention. Licensed under the [MIT License](LICENSE).

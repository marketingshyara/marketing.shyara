# Shyara Marketing

Digital marketing and technology services website for Shyara Marketing, a brand under Shyara Tech Solutions (OPC) Pvt. Ltd.

## About

Shyara Marketing helps businesses grow through social media management, advertising campaigns, website development, and app development with clarity, consistency, and measurable results.

## Technologies

This project is built with:

- **Vite** - Fast build tool and development server
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **React Router** - Client-side routing
- **React Helmet Async** - SEO management

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/shyarademo/shyara-marketing-demo.git
cd shyara-marketing-demo
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:8080`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/     # Reusable React components
│   ├── ui/        # shadcn/ui components
│   └── modals/    # Service detail modals
├── pages/         # Route pages
├── assets/        # Images and static assets
├── hooks/         # Custom React hooks
├── lib/           # Utility functions
└── main.tsx       # Application entry point
```

## Features

- Responsive design with mobile-first approach
- Dark/Light theme support
- SEO optimized with meta tags and structured data
- Service modals with pricing information
- Contact form with WhatsApp integration
- Legal pages (Privacy Policy, Terms of Service, etc.)

## Deployment

Build the project for production:

```bash
npm run build
```

The `dist` folder will contain the production-ready files that can be deployed to any static hosting service.

## License

Copyright © 2025 Shyara Marketing. All rights reserved.

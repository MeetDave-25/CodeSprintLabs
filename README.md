# CodeSprint Labs

A modern, visually stunning web platform for student internships with 3D components, smooth animations, and premium design aesthetics.

## 🚀 Features

- **3D Graphics**: Interactive 3D cube and particle field backgrounds
- **Smooth Animations**: Framer Motion powered transitions and micro-interactions
- **Modern Design**: Glassmorphism, gradients, and premium visual effects
- **Responsive**: Works perfectly on desktop, tablet, and mobile
- **TypeScript**: Full type safety throughout the application
- **Component Library**: Reusable UI components with multiple variants

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **3D Graphics**: React Three Fiber + Three.js
- **Charts**: Recharts
- **Icons**: Lucide React

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🌐 Pages

### Public Pages
- **Homepage**: 3D hero section, features showcase, domain selection
- **Internships**: Searchable internship listings with filters
- **Login/Register**: Multi-step authentication with 3D backgrounds

### Student Dashboard
- **Dashboard**: Analytics, progress tracking, recent tasks
- **Tasks**: Daily coding challenges
- **Submissions**: Task submission history
- **Courses**: Enrolled courses and materials
- **Profile**: User settings and achievements

### Admin Dashboard
- **Dashboard**: Platform analytics with charts
- **Internships**: CRUD operations for internships
- **Tasks**: Task management system
- **Students**: User management
- **Submissions**: Review and approve student work
- **Courses**: Course content management

## 🎨 Design Features

- Vibrant gradient color schemes
- Glassmorphism effects
- 3D hover animations
- Smooth page transitions
- Custom scrollbar
- Neon glow effects
- Animated progress bars
- Particle backgrounds

## 📱 Responsive Design

The application is fully responsive and works seamlessly across:
- Desktop (1920px+)
- Laptop (1024px - 1920px)
- Tablet (768px - 1024px)
- Mobile (320px - 768px)

## 🔧 Development

```bash
# Type checking
npm run type-check

# Linting
npm run lint
```

## 📝 Next Steps

This is a frontend-only implementation. For production use, integrate:

1. **Backend API**: Authentication, database operations
2. **Database**: PostgreSQL, MongoDB, or Supabase
3. **File Storage**: AWS S3, Cloudinary for uploads
4. **Payment Gateway**: Stripe, PayPal for course purchases
5. **Email Service**: SendGrid for notifications

## 🎯 Project Structure

```
app/                    # Next.js app directory
├── auth/              # Authentication pages
├── student/           # Student dashboard
├── admin/             # Admin dashboard
└── internships/       # Public internship pages

components/            # Reusable components
├── ui/               # UI components (Button, Card, etc.)
├── 3d/               # 3D components
└── layout/           # Layout components

lib/                  # Utility functions
types/                # TypeScript type definitions
```

## 📄 License

All rights reserved. This project is proprietary.

## 🤝 Contributing

This is a private project. Contact the administrator for contribution guidelines.

---

Built with ❤️ using Next.js, React, and TypeScript
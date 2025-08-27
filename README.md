# 🌾 GrowGuard - Protecting Crop Growth Platform

![GrowGuard Dashboard](/docs/images/Dashboard.png)
*[View Full Design in Figma](https://www.figma.com/design/m62sDsoYwcVMIYBlp5Fbx4/Agronomist-Farmer?node-id=165-695&t=t8Oy6K65uUQKExon-1)*

![Docker](https://img.shields.io/badge/docker-ready-blue?logo=docker)
![Django](https://img.shields.io/badge/backend-django-green?logo=django)
![React](https://img.shields.io/badge/frontend-react-blue?logo=react)
![License: MIT](https://img.shields.io/badge/license-MIT-yellow)

---

## 🚀 Project Overview

**GrowGuard** is a collaborative platform connecting agronomists and farmers through real-time, geolocated agricultural alerts. Agronomists can publish critical information about crop threats and best practices, while farmers receive relevant, location-based notifications tailored to their specific crops and location.

---

## 🎯 Problem & Solution

### The Challenge
Farmers often lack timely access to expert agricultural knowledge, especially regarding localized threats like pests, diseases, or adverse weather conditions that can significantly impact crop yields.

### Our Solution
GrowGuard bridges this gap by creating a direct channel between agronomists and farmers, delivering targeted, actionable insights through a user-friendly platform with real-time notifications and precise geographical targeting.

---

## ✨ Key Features

### For Agronomists
- **Alert Management**: Create and publish geolocated agricultural alerts
- **Precision Targeting**: Define specific radius (1-50km) for alert dissemination
- **Crop-Specific Advice**: Target alerts to specific crop types
- **Impact Analytics**: Monitor reach and engagement with published alerts

### For Farmers
- **Personalized Feed**: Receive alerts relevant to location and crops
- **Interactive Map**: Visualize nearby agricultural threats and advice
- **Real-time Notifications**: Instant alerts via WebSocket technology
- **Customizable Preferences**: Set notification radius and crop interests

### Platform Capabilities
- **Role-based Dashboards**: Tailored experiences for different user types
- **Mobile-Responsive Design**: Optimized for field use on mobile devices
- **Secure Authentication**: JWT-based security with email verification
- **Multi-language Ready**: Foundation built for future localization

---

## 🛠️ Technology Stack

### Backend
- **Django 5** & **Django REST Framework** - Robust API foundation
- **Django Channels** - WebSockets for real-time notifications
- **PostgreSQL** - Production-ready database
- **JWT Authentication** - Secure token-based auth (dj-rest-auth)
- **SMTP Integration** - Email verification and notifications

### Frontend
- **React 19 with TypeScript** - Modern, type-safe frontend
- **Radix UI** & **Tailwind CSS 4** - Accessible, responsive styling
- **React Router DOM 7** - Client-side navigation
- **React Hook Form & Zod** - Form handling with validation
- **Leaflet** - Interactive mapping functionality
- **Sonner** - User notifications

### Infrastructure & DevOps
- **Docker & Docker Compose** - Containerized development and deployment
- **Makefile Automation** - Simplified development workflows
- **Hot Reload Development** - Efficient development experience

---

## 📊 System Architecture

```mermaid
graph TB
    subgraph Frontend
        UI[React UI Components]
        Map[Leaflet Map]
        State[State Management]
        Forms[Form Handling]
    end

    subgraph Backend
        API[Django REST API]
        WS[WebSocket Server]
        DB[(PostgreSQL)]
        Auth[Authentication]
    end

    subgraph External Services
        Email[SMTP Service]
        Storage[File Storage]
    end

    UI --> API
    UI --> WS
    API --> DB
    API --> Auth
    API --> Email
    API --> Storage
    WS --> DB
```

---

## ⚡ Quick Start Guide

### Prerequisites
Ensure you have the following installed:
- [Docker](https://www.docker.com/get-started/) (version 20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0+)
- [Git](https://git-scm.com/downloads)

### 1. Clone & Navigate
```bash
git clone https://github.com/your-username/GrowGuard.git
cd GrowGuard
```

### 2. Environment Configuration

Create your environment files based on the examples provided:

**Root Directory `.env`:**
```env
# Django Configuration
SECRET_KEY=your-super-secret-django-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:3000

# Database
DATABASE_URL=sqlite:///db.sqlite3

# Default Admin User (Created automatically)
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_EMAIL=admin@GrowGuard.com
DJANGO_SUPERUSER_PASSWORD=admin123

# Email Configuration (Optional for development)
EMAIL_URL=smtp://user:password@localhost:25
```

**Frontend Environment `frontend/.env`:**
```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

### 3. Launch the Application
```bash
# Build and start all services
make up

# Alternative: Direct docker-compose
docker-compose up --build
```

### 4. Access Your Application
- **Frontend Application:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:8000](http://localhost:8000)
- **Django Admin Panel:** [http://localhost:8000/admin](http://localhost:8000/admin)
- **API Documentation:** [http://localhost:8000/api/docs](http://localhost:8000/api/docs)

### 5. Default Login Credentials
- **Admin User:** admin@GrowGuard.com / admin123
- Create additional users through the registration flow

---

## 💡 Usage Examples

### API Endpoints

**Create an Agricultural Alert:**
```bash
curl -X POST http://localhost:8000/api/alerts/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Aphid Outbreak Alert - Immediate Action Required",
    "location": "Casablanca, Morocco",
    "latitude": 33.5731,
    "longitude": -7.5898,
    "crop": "wheat",
    "severity": "high",
    "description": "Green aphids detected on lower wheat leaves. Recommended treatment: Apply neem-based spray early morning (6-8 AM). Monitor daily for 1 week.",
    "radius_km": 15
  }'
```

---

## 📁 Project Structure

```
GrowGuard/
├── backend/                     # Django backend application
│   ├── src/
│   │   ├── alerts/             # Alert models, views, serializers
│   │   │   ├── models.py       # Alert data models
│   │   │   ├── views.py        # API views
│   │   │   ├── serializers.py  # Data serialization
│   │   │   └── urls.py         # Alert URL patterns
│   │   ├── notifications/      # Real-time notification system
│   │   ├── users/              # User management & authentication
│   │   ├── app/                # Django project configuration
│   │   │   ├── settings.py     # Django settings
│   │   │   ├── urls.py         # Main URL configuration
│   │   │   └── wsgi.py         # WSGI configuration
│   │   └── manage.py           # Django management script
│   ├── requirements.txt        # Python dependencies
│   └── Dockerfile              # Backend container configuration
├── frontend/                   # React frontend application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Application pages/views
│   │   ├── hooks/              # Custom React hooks
│   │   ├── utils/              # Utility functions
│   │   ├── types/              # TypeScript type definitions
│   │   └── main.tsx            # Application entry point
│   ├── public/                 # Static assets
│   ├── package.json            # Node.js dependencies
│   └── Dockerfile              # Frontend container configuration
├── docs/                       # Documentation and assets
│   └── images/                 # Screenshots and design assets
├── docker-compose.yml          # Multi-container orchestration
├── Makefile                    # Common development commands
├── .env.example                # Environment variables template
└── README.md                   # Project documentation
```

---

## 🔧 Available Commands

The project includes a Makefile for common development tasks:

```bash
make up          # Start all services
make down        # Stop all services
make build       # Build all containers
make logs        # View container logs
make shell       # Access backend shell
make migrate     # Run database migrations
make test        # Run test suite
make clean       # Clean up containers and volumes
```

---

## 🌍 Environment Setup

### Development Environment
- Uses SQLite for quick setup
- Debug mode enabled
- Hot reload for both frontend and backend
- Detailed error logging

### Production Considerations
- Switch to PostgreSQL database
- Set DEBUG=False
- Configure proper email SMTP settings
- Set up SSL certificates
- Configure environment-specific CORS settings
- Set up proper logging and monitoring

---

## 🤝 Contributing

We welcome contributions to GrowGuard! Here's how you can help:

### Getting Started
1. Fork the repository on GitHub
2. Clone your fork locally
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Make your changes and commit them with clear messages
5. Push to your fork and submit a pull request

### Development Guidelines
- Follow the existing code style and conventions
- Write clear, descriptive commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

### Code Style
- **Backend:** Follow PEP 8 for Python code
- **Frontend:** Use ESLint and Prettier configurations
- **Commit Messages:** Use conventional commit format

---

## 🗺️ Development Roadmap

### Phase 1: MVP (Completed)
- [x] MVP: Real-time alerts with geolocation
- [x] Role-based dashboards (Agronomist/Farmer)
- [x] Interactive map with Leaflet integration
- [x] WebSocket notifications
- [x] Email verification system

### Phase 2: Enhanced Features (Planned)
- [ ] Multi-language support (Arabic, French, English)
- [ ] Advanced analytics dashboard
- [ ] Weather API integration
- [ ] Crop disease identification via image upload
- [ ] AI-powered alert recommendations
- [ ] Advanced reporting and analytics

---

## 🐛 Troubleshooting

### Common Issues

**Docker containers not starting:**
```bash
# Clean up and rebuild
make clean
make build
make up
```

**Frontend not connecting to backend:**
- Check that VITE_API_URL in frontend/.env-frontend matches your backend URL
- Ensure CORS settings allow your frontend domain

**Database issues:**
```bash
# Reset database
make down
docker volume rm GrowGuard_postgres_data  # if using postgres
make up
```

**WebSocket connection issues:**
- Verify WebSocket URL configuration
- Check firewall settings
- Ensure Django Channels is properly configured

---

## 📞 Support & Contact
https://github.com/Mustapha-Moumanis/agricultural-app/edit/main/README.md
- **Issues:** Open an issue on [GitHub Issues](https://github.com/Mustapha-Moumanis/GrowGuard/issues)
- **Discussions:** Join our [GitHub Discussions](https://github.com/Mustapha-Moumanis/GrowGuard/discussions)
- **Email:** [moumanis.mustapha@gmail.com](mailto:moumanis.mustapha@gmail.com)

---

## 🙏 Acknowledgments

Special thanks to:
- The Django and React communities for excellent documentation
- OpenStreetMap and Leaflet for mapping capabilities
- All contributors who help improve GrowGuard

---

*Built with ❤️ for the agricultural community*
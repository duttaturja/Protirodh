# 🛡️ Protirodh — Community Safety & Rapid Response Platform

Protirodh is a community-driven safety, awareness, and rapid-response platform designed to empower citizens, report local incidents, send SOS alerts, and stay informed through a real-time social feed and interactive map system.

This platform focuses on **public safety**, **community vigilance**, and **preventive awareness**, aligning strongly with **UN SDG 11: Sustainable Cities & Communities** and **SDG 16: Peace, Justice & Strong Institutions**.

---

## 🚀 Live Demo Access (Test Credentials)

If you want to explore the platform, log in using the test user account:

```
  email: user@user.com
  password: 1234
```


---

## 🧩 Feature Access Overview

Below is the verified/unverified permission matrix included in the platform:

| Feature              | Verified User | Unverified User |
|----------------------|:-------------:|:---------------:|
| View Feed & Map      | ✔️            | ✔️              |
| Create Reports       | ✔️            | ❌              |
| Upvote / Downvote    | ✔️            | ❌              |
| Comment on Posts     | ✔️            | ❌              |
| Share / Retweet      | ✔️            | ❌              |
| Follow Users         | ✔️            | ❌              |
| Send SOS Alerts      | ✔️            | ❌              |

---

## 🔥 Key Features

### 🗺️ **Real-time Feed & Map**
- View incidents happening around you
- Safety markers displayed on a dynamic map
- Geo-tagged posts for local awareness

### 🚨 **SOS Alert System**
- Immediate one-tap emergency alert  
- Notifies followers and nearby verified users

### 📝 **Incident Reporting**
- Create detailed reports with location, photos & description
- Helps communities stay aware and avoid dangerous zones

### 👍 **Community Interaction**
- Upvote, downvote, and comment on community reports  
- Follow users, share posts, and build an informed network

### 🔐 **Verification System**
- Certain features (SOS, reporting, interaction) require verified accounts  
- Ensures authenticity and reduces misuse

### ✨ **Clean UI with Dark Mode**
- Designed for readability during emergencies  
- Modern, minimal, safety-focused UI

---

## 🏗️ Tech Stack

### **Frontend**
- Next.js 16 (App Router)
- ShadCN UI Components
- Leaflet / Mapbox for maps

### **Backend**
- Next.js API Routes
- MongoDB + Mongoose

### **Auth**
- NextAuth.js (Credentials Provider)
- JWT / Session-based Authentication

---

## 📁 Project Structure (Simplified)

```plaintext
├── app/                # Next.js App Router pages & API routes
│   ├── (site)/         # Main user-facing layouts (Feed, Profile, etc.)
│   ├── admin/          # Admin dashboard
│   ├── api/            # Backend API endpoints (Auth, Reports, AI, etc.)
│   └── auth/           # Authentication pages (Login, Register)
├── components/         # Reusable UI components (Shadcn + Custom)
├── lib/                # Utility libraries (MongoDB, Gemini, Auth config)
├── models/             # Mongoose Database Schemas
├── public/             # Static assets
└── utils/              # Helper functions (Image processing, Password hashing)
```

---

## 🛠️ Installation & Setup

### **1️⃣ Clone the Repository**
```bash
git clone https://github.com/duttaturja/protirodh
cd protirodh
```

### **2️⃣ Install Dependencies**
```bash
npm install
```
### **3️⃣ Setup Environment Variables
Create a `.env.local` file:

```bash
# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/protirodh

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_super_secret_random_string

# Cloudinary (Image Uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Twilio (SMS Verification)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=your_twilio_number

# Admin Seeding
ADMIN_EMAIL=admin_email
ADMIN_PASSWORD=secure_admin_password
```

You can generate a NextAuth secret using:
```bash
openssl rand -base64 32
```

### **4️⃣ Run the Project**
```bash
npm run dev
```

Your app will now be live at:
```bash
http://localhost:3000
```
---
## 🤝 Contribution Guide

We welcome contributors! To contribute:

- Fork the repo
- reate a new branch (feature/my-feature)
- Commit your changes
- Open a pull request
---
## 📜 License

This project is distributed under the [MIT LICENSE](LICENSE).
You are free to use, modify, and distribute with attribution.

---

## ❤️ Acknowledgments

- **Google Gemini** for powering the AI verification engine.
- **Vercel** for hosting infrastructure.
- **Shadcn UI** for the beautiful component library.

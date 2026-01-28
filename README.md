# MelaVibe

### Real-Time Festival Operations PWA

A **modern, multilingual, AI-powered Progressive Web App (PWA)** built for seamless festival and large-event management. MelaVibe is a **production-ready, real-time system** designed to bridge the communication gap between event attendees and organizers, ensuring safer, smoother, and better-coordinated events.

Attendees can report issues instantly, while organizers get a **live command center** with AI-powered triage, real-time maps, analytics, and operational tools—demonstrating strong **full-stack engineering, system design, and product thinking**.

---

## ✨ Key Features

### 🚀 Real-Time Collaboration

* Powered by **Firebase Realtime Database**
* Attendee reports appear instantly on the organizer dashboard
* Live syncing of report status updates and organizer comments
* Enables a true **two-way communication loop**

### 🤖 Expert AI Triage

* Integrates **Google Gemini API** with an expert-system prompt
* Acts as a virtual **public safety dispatcher**
* Automatically provides:

  * Concise issue summary
  * Accurate priority level (Low / Medium / High)
  * Suggested response team

### 🌐 Fully Multilingual

* Fully internationalized UI
* Supports **6 major Indian languages**:

  * English
  * Hindi
  * Telugu
  * Bengali
  * Marathi
  * Tamil

### 📱 Offline-First Progressive Web App

* Instant app shell loading, even without internet
* Graceful offline handling by disabling network-dependent actions
* Reliable experience in high-density or low-connectivity environments

### 🎤 Multi-Modal Reporting

* Issue reporting via:

  * Text
  * Photos
  * Voice notes
  * Geolocation

### 📊 Organizer Command Center

A dedicated operations dashboard featuring:

#### 🗺 Live Map Dashboard

* Interactive map with geo-tagged reports
* Color-coded pins based on AI priority
* Instant spatial awareness for rapid response

#### 🎒 Lost & Found Hub

* End-to-end lost & found management
* Attendee submissions with visual browsing
* Organizer resolution tracking

#### 📈 Post-Event Analytics

* Generate and print detailed reports
* Charts and key metrics such as:

  * Average resolution time
  * Issue distribution
* Supports data-driven planning for future events

#### 🔍 Advanced Filtering & Sorting

* Sort reports by time or AI priority
* Filter by issue status to manage high volumes efficiently

### 📢 Broadcast Announcements

* Organizers can send real-time announcements
* Displayed as live banners to all active attendees

### 🔄 Centralized QR Tools

A unified hub for all QR-based workflows:

* **Effortless Onboarding**
  First organizer generates a secure *Setup QR Code* for new team members to scan, bypassing manual configuration

* **Robust Report Syncing**
  Securely share and sync reports between organizers using report IDs (fetches full data including media)

* **Simple App Sharing**
  Instantly share the app link with attendees or staff

### 🌓 Light & Dark Mode

* Clean, modern UI
* Full support for both light and dark themes

---

## 🛠 Tech Stack

### Frontend

* React
* TypeScript
* Tailwind CSS

### Real-Time & Backend Services

* Firebase Realtime Database

### AI Services

* Google Gemini API

### Progressive Web App

* Web App Manifest
* Service Workers

### Deployment

* Vercel (or any modern static hosting platform)

---

## 🚀 Getting Started

MelaVibe uses a **no-code, in-app setup flow** for rapid configuration.

### 1️⃣ Firebase Configuration (In-App)

No code changes required.

#### First Organizer (Admin Setup)

1. Deploy and open the application
2. On first launch, the **MelaVibe Setup** screen appears
3. Locate your `firebaseConfig` object in Firebase Project Settings
4. Paste the entire configuration object into the setup form
5. Click **Save Configuration** — the app stores it securely in local storage and reloads

#### Onboarding New Organizers

* Existing organizer navigates to **QR Tools → Share Setup**
* Generates a secure Setup QR Code
* New organizers scan the code from the setup screen for instant configuration

---

### 2️⃣ Configure Google Gemini API Key

For security, the Gemini API key must be provided via environment variables.

* Deployment (Vercel):

  * Create an environment variable named `API_KEY`
  * Set its value to your Gemini API key from **Google AI Studio**
* The application automatically reads this variable

---

### 3️⃣ Update Firebase Security Rules

Before deployment, secure the database:

1. Go to **Firebase Console → Realtime Database → Rules**
2. Copy the contents of the provided `rules.json` file
3. Paste into the Firebase console editor
4. Click **Publish**

---

### 4️⃣ Deploy

Once deployed:

* Complete the one-time Firebase setup
* The application becomes fully functional and production-ready

---

## 🌐 Live Demo

**Demo:** [https://melavibeonlinefinal.vercel.app/](https://melavibeonlinefinal.vercel.app/)

> Scan the QR code inside the application for database configuration.

<img width="833" height="827" alt="image" src="https://github.com/user-attachments/assets/e4fceb0d-bc51-4985-bdb3-06ef8d929b7b" />


---

## 📌 Project Highlights

* **100+ real users tested**
* Fully **deployed & production-ready**
* Designed with **real-time scalability** in mind
* Demonstrates **full-stack engineering + system design**
* Built with strong focus on **offline-first reliability**

## 👨‍💻 Author

**Kamshetty Varun**
B.Tech – Computer Science & Engineering (AI & ML)


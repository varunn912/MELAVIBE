# MelaVibe: Real-Time Festival Operations PWA

**A modern, multilingual, AI-powered Progressive Web App for seamless festival and large-event management.**

MelaVibe is a production-ready web application designed to bridge the communication gap between event attendees and organizers. It provides a robust platform for attendees to report issues in real-time. Organizers get a live command center with AI-powered insights, advanced data visualization, and comprehensive management tools to ensure a safer and better-organized event.

---

## ✨ Key Features

-   **🚀 Real-Time Collaboration**: Powered by **Firebase Realtime Database**, reports from attendees appear instantly on the organizer's dashboard. Status changes and organizer comments are synced live for a two-way communication loop.
-   **🤖 Expert AI Triage**: Utilizes the **Google Gemini API** with an expert-system prompt to act as a virtual public safety dispatcher. It automatically analyzes reports, providing a concise summary, a highly accurate priority level (Low, Medium, High), and a suggested response team.
-   **🌐 Fully Multilingual**: Fully internationalized with support for **6 major Indian languages**: English, Hindi, Telugu, Bengali, Marathi, and Tamil.
-   **📱 Offline-First PWA**: As a Progressive Web App, the application shell loads instantly, even offline. The UI gracefully handles offline states by disabling actions that require a connection.
-   **🎤 Multi-Modal Reporting**: Attendees can report issues using text, photos, voice notes, and geolocation.
-   **📊 Comprehensive Organizer Command Center**: A dedicated view for organizers featuring:
    -   **Live Map Dashboard**: Visualize all geo-tagged reports on an interactive map with color-coded priority pins for immediate spatial awareness.
    -   **Lost & Found Hub**: A complete system for managing lost and found items, from attendee reporting and visual browsing to organizer resolution.
    -   **Post-Event Analytics**: Generate and print detailed analytics reports with charts and key metrics like average resolution time to inform future planning.
    -   **Advanced Filtering & Sorting**: Easily manage high volumes of reports by sorting by time or AI priority and filtering by status.
-   **📢 Broadcast Announcements**: Organizers can send real-time announcements that appear as a banner to all active attendees.
-   **🔄 Centralized QR Tools**: A unified hub for all QR-based actions:
    -   **Effortless Onboarding**: The first organizer can generate a "Setup QR Code" for new team members to scan, bypassing manual configuration.
    -   **Robust Report Syncing**: Securely share and sync reports between organizers by sharing report IDs, which fetch full data (including media) from the database.
    -   **Simple App Sharing**: Quickly share a link to the app with anyone.
-   **🌓 Light & Dark Mode**: A sleek, modern UI with full support for both light and dark themes.

---

## 🛠️ Tech Stack

-   **Frontend**: React, TypeScript, Tailwind CSS
-   **Real-Time Database**: Firebase Realtime Database
-   **AI Services**: Google Gemini API
-   **PWA**: Web App Manifest & Service Workers
-   **Deployment**: Vercel (or any modern static host)

---

## 🚀 Getting Started

Configuring MelaVibe is simple with our new in-app setup. You will need your **Firebase** configuration and a **Google Gemini API key**.

### 1. Configure Firebase (In-App)

There is **no need to edit any code** for the Firebase setup. The application uses a seamless in-app configuration flow.

-   **For the First Organizer (Admin Setup):**
    1.  Deploy and open the application. On first launch, you will see a **"MelaVibe Setup"** screen.
    2.  Follow the instructions to find your Firebase configuration object in your [Firebase project settings](https://console.firebase.google.com/).
    3.  Copy the entire `firebaseConfig` JavaScript object and paste it into the text area.
    4.  Click **"Save Configuration"**. The app will save the configuration to your browser's local storage and reload, connecting automatically.

-   **For Onboarding New Organizers:**
    1.  The first organizer can go to **`QR Tools -> Share Setup`** on their dashboard to generate a secure QR code.
    2.  New team members can simply tap the **"Scan Setup QR Code"** button on the setup screen and scan the code to be instantly configured.

### 2. Configure Gemini API Key

For security, the Google Gemini API key **must** be provided as an environment variable by your deployment platform.

-   **Deployment**: When deploying to a host like Vercel, create an environment variable named `API_KEY` and set its value to your Gemini API key from [Google AI Studio](https://aistudio.google.com/). The application is built to read this variable automatically.

### 3. Update Firebase Security Rules

Before deploying, you must secure your database to ensure data integrity.
1.  Go to your **Firebase project -> Realtime Database -> Rules** tab.
2.  Copy the entire content of the `rules.json` file from this project.
3.  Paste it into the editor in the Firebase console and click **"Publish"**.

### 4. Deploy

Once your security rules are in place, deploy the application. Open it, complete the one-time Firebase setup, and the application will be fully functional.

DEMO: https://melavibeonlinefinal.vercel.app/

<img width="1279" height="1147" alt="image" src="https://github.com/user-attachments/assets/96f25098-a4d8-4420-a1c5-2ab6e307ac66" />

SCAN THE ABOVE QR AFTER YOU ENTER INTO THE APPLICATION, FOR DATABASE CONFIGURATION.


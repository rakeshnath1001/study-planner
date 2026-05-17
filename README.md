<div align="center">
  <img src="https://img.icons8.com/color/96/000000/calendar--v1.png" alt="StudyPlanner Logo" width="80" />
  
  # StudyPlanner
  
  **An intelligent, AI-powered productivity deck designed for modern students.** <br />
  *Crystal clear organization, glassy aesthetics, and precision planning.*

  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Firebase](https://img.shields.io/badge/firebase-ffca28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
</div>

<br />

## ✨ Features

- 🧠 **AI-Powered Planning:** Automatically generate structured daily study schedules from long-term goals using Gemini AI integration.
- 📊 **Dynamic Dashboard:** Track your daily progress, active streaks, completed tasks, and view productivity metrics through beautiful, interactive charts.
- 📅 **Interactive Calendar:** Manage your schedule with intuitive Grid and List views. Quickly schedule tasks on specific days with a seamless UI.
- 🎯 **Goal Tracking:** Establish long-term milestones and monitor your overall evolution progress visually.
- 🎨 **Premium Glassmorphism UI:** A sleek, responsive, light-themed interface built with Tailwind CSS, utilizing Neubrutalism design cues and smooth micro-animations.
- 🔔 **Global Notifications:** Real-time feedback for all actions (creating, completing, deleting) via non-intrusive toast notifications.
- 🔐 **Secure Authentication:** Integrated Google Sign-In powered by Firebase Authentication.

## 🛠 Tech Stack

- **Frontend Framework:** React 18 with Vite
- **Styling:** Tailwind CSS (Custom Theme, Glassmorphism, Animations)
- **Database & Auth:** Firebase (Firestore, Authentication)
- **Icons:** Lucide React
- **Animations:** Motion (Framer Motion)
- **Data Visualization:** Recharts
- **Date Formatting:** date-fns
- **Notifications:** React Hot Toast

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v16.x or higher)
- npm or yarn or pnpm
- A Firebase project (for Auth and Firestore)

### 1. Clone the repository

```bash
git clone https://github.com/rakeshnath1001/study-planner.git
cd study-planner
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Environment Variables

Create a `.env` file in the root of your project and add your Firebase configuration. You can find these details in your Firebase Console under Project Settings.

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Run the development server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## 📁 Project Structure

```text
study-planner/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components (Modals, Buttons, etc.)
│   ├── lib/                # Context providers (Auth, Study Contexts) and Firebase config
│   ├── pages/              # Application views (Dashboard, Calendar, Activity, etc.)
│   ├── types/              # TypeScript interface definitions
│   ├── App.tsx             # Main routing and Toaster setup
│   ├── index.css           # Global styles and Tailwind configuration
│   └── main.tsx            # React application entry point
├── .env                    # Environment variables
├── tailwind.config.js      # Tailwind CSS configuration
└── package.json            # Project dependencies and scripts
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check the [issues page](https://github.com/rakeshnath1001/study-planner/issues).

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---
<div align="center">
  Built with ❤️ to make learning more efficient and aesthetically pleasing.
</div>

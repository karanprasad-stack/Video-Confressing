# 🎥 Apna Video Call — MERN WebRTC Video Conferencing App

[![React](https://img.shields.io/badge/React-19.1-blue.svg?logo=react&logoColor=white)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green.svg?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-black.svg?logo=socket.io&logoColor=white)](https://socket.io/)
[![Material UI](https://img.shields.io/badge/MUI-v7-blue.svg?logo=mui&logoColor=white)](https://mui.com/)
[![WebRTC](https://img.shields.io/badge/WebRTC-Signaling-orange.svg?logo=webrtc&logoColor=white)](https://webrtc.org/)

**Apna Video Call** is a modern, responsive, and secure video conferencing application built with the MERN stack. Utilizing WebRTC for peer-to-peer audio/video streaming and Socket.io for low-latency signaling and live chat, it offers a seamless communication experience.

---

## ✨ Features

- ⚡ **Guest Join:** Join meetings instantly without registering or logging in.
- 🔐 **Secure Auth:** Host accounts with encrypted credentials via bcrypt.
- 📞 **Real-Time Video/Audio:** Crystal clear, low-latency streaming utilizing WebRTC connection setups.
- 💬 **In-Meeting Chat:** Broadcast instant messages to all participants during the call.
- 📂 **Meeting History:** Save and view previous meetings with quick copy-code & re-join options for authenticated users.
- 🎨 **Premium UI/UX:** Styled using Material-UI (MUI) with modern gradients, dark mode aesthetics, and micro-interactions by Framer Motion.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19 (via Vite)
- **Styling:** Material UI (MUI v7), Vanilla CSS
- **Animations:** Framer Motion
- **Networking:** Axios, Socket.io-client
- **Routing:** React Router DOM (v7)

### Backend
- **Platform:** Node.js (ES Modules syntax)
- **Framework:** Express
- **Database:** MongoDB (via Mongoose)
- **Sockets:** Socket.io
- **Security:** bcrypt

---

## 📂 Project Structure

```
Video Confressing/
├── Backend/                 # Express & Socket.io Server
│   ├── src/
│   │   ├── controllers/     # socketManager.js, user.controller.js
│   │   ├── middleware/      # Auth & logging middleware
│   │   ├── models/          # User and Meeting models
│   │   └── routes/          # API endpoints
│   ├── app.js               # Entry point & CORS configuration
│   └── package.json
│
└── Frontend/
    └── my-react-app/        # Vite-React UI Web Application
        ├── src/
        │   ├── pages/       # VideoMeet, Authentication, History, Home, Landing
        │   ├── context/     # AuthContext for state preservation
        │   ├── main.jsx     # Main entry point
        │   └── environment.js
        └── package.json
```

---

## 🚀 Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) installed
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or local MongoDB instance running

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/karanprasad-stack/Video-Confressing.git
cd Video-Confressing
```

### Step 2: Configure Environment Variables

#### Backend Configuration
Create a `.env` file in the `Backend` directory:
```env
PORT=8000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

#### Frontend Configuration
Configure server URL in `Frontend/my-react-app/src/environment.js`:
```javascript
const server = import.meta.env.VITE_API_URL || "http://localhost:8000";
export default server;
```

---

### Step 3: Install Dependencies & Run

#### Backend Server
```bash
cd Backend
npm install
npm run dev
```

#### Frontend Client
```bash
cd ../Frontend/my-react-app
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🌐 Production Deployment

- **Backend:** Configured to deploy on services like Render, Heroku, or PM2 (`npm run prod`).
- **Frontend:** Build a production static bundle using `npm run build` and deploy on Vercel, Netlify, or AWS S3.

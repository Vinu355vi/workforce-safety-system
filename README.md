# Workforce Safety System 🛡️

![Workforce Safety System - Landing Page](./assets/screens/landing.png)
<p align="center">
  <img src=".\frontend\assets\land.png" width="500"/>
</p>


## 📖 About the Project

The **Workforce Safety System** is an intelligent, AI-driven computer vision application designed specifically for industrial, construction, and manufacturing environments. Empower your site management by automatically detecting missing Personal Protective Equipment (PPE) like helmets, masks, and safety vests. It identifies hazardous zone entries and worker safety incidents in real-time, providing instant alerts and comprehensive safety reports to ensure total workplace compliance.

## 🛠️ Technical Stack

*   **Frontend:** Next.js (App Router), React, TailwindCSS, Framer Motion, Chart.js.
*   **Backend:** Node.js, Express.js.
*   **Database:** PostgreSQL with Sequelize ORM.
*   **AI/ML Models:** TensorFlow.js (TFJS) running coco-ssd (lite_mobilenet_v2 baseline) for edge-computing real-time inferences, alongside backend YOLO-style object trackers.
*   **Real-time Communication:** Socket.io (WebSockets) for bidirectional detection telemetry and alerts.
*   **File Management:** Multer for pre-recorded video staging and processing.

## 🧩 Core Modules

The system is divided into four principal pillars tailored for safety monitoring:

1.  **📷 Live CCTV Monitoring**
    Connects to existing camera infrastructure or webcam streams. It performs real-time edge processing to track active workers and validate PPE compliance instantly without overwhelming the server with video streams.
    
2.  **🎥 Video Analysis**
    Upload pre-recorded project footage for detailed, post-incident analysis. Processed seamlessly via backend algorithms to extract frame-by-frame compliance timelines and worker tracking.

3.  **📈 Automated Reporting**
    A robust analytics dashboard that aggregates live telemetry and historical video analysis. Automatically generates comprehensive daily, weekly, and monthly safety compliance reports, exportable in PDF and Excel formats.

4.  **⚡ Instant Alerts**
    A reactive notification system that receives immediate websocket events when workers enter hazardous zones or remove necessary PPE while on active duty, logging severity and unread statuses.

## 🏗️ System Architecture

*   **Client-Side Edge Computing:** To preserve bandwidth and reduce server-side load, real-time video stream inferences run directly in the browser via WebGL-accelerated TFJS models.
*   **Event-Driven Syncing:** Browser-detected coordinates and compliance flags are emitted via Socket.io at fixed intervals (
equestAnimationFrame) back to the Node backend.
*   **State-Hydrating API:** The backend consumes live-detection arrays, cross-references internal states using a TrackingService, and persists anomalous events (new workers, PPE violations) into PostgreSQL.
*   **Stateless REST:** Pre-computed metrics, video endpoints, and report generators are served via traditional Express REST controllers.

## 🧠 Algorithm Details

*   **Object Detection:** The application primarily delegates standard bounds-mapping to coco-ssd, generating [x, y, width, height] coordinates for workers.
*   **Non-Maximum Suppression (NMS) & Intersection over Union (IoU):** Redundant overlapping bounding boxes are suppressed by discarding low-confidence overlaps (IoU thresholding). Check the yoloDetector.js implementation for custom box merging logic.
*   **Proximity-Based Hierarchy:** In video analyses, to associate PPE objects (like helmets or vests) to specific personnel, the system uses center-point Euclidean distance formulas. A threshold radius associates the detected safety gear exclusively to the underlying person's bounding box.
*   **Inactivity Thresholding:** Workers detected continuously standing still without status variance for durations surpassing the 300000ms (5 minutes) threshold trigger inactivity warnings mathematically mapped relative to the timeline sequence.

## 💻 How to Set Up

### Prerequisites
*   Node.js (v18+)
*   Running PostgreSQL instance.

### 1. Backend Setup

`ash
cd backend
npm install
`

Configure your .env file in /backend:
`env
DB_NAME=workforce_safety
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
PORT=5000
VIDEO_STORAGE_PATH=./uploads
`

Start the backend server:
`ash
npm run dev
# The backend will start on http://localhost:5000 
# Note: Sequelize will auto-sync your tables on initialization.
`

### 2. Frontend Setup

`ash
cd frontend
npm install
`

Configure your .env.local file in /frontend:
`env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_WS_URL=http://localhost:5000
`

Start the Next.js client:
`ash
npm run build
npm run dev
# The frontend will be available at http://localhost:3000
`

## 📸 Sample Screens

Below are some visual representations of the application:

### Landing & Services Home

![future View](./assets/future.png)
![Workforce Safety System - Landing Page](./assets/screens/service.png)
<p align="center">
  <img src=".\frontend\assets\future.png" width="500"/>
</p>
*(Note: Replace local placeholder links with your actual final asset directory paths)*

---

## 📜 Copyright

**© 2026 Workforce Safety System. All rights reserved.**

No part of this application, including algorithms, architectural designs, UI concepts, or backend controllers, may be reproduced, distributed, or transmitted in any form or by any means without the prior written permission of the owner.

# 🩸 Blood Bank Management System

A modern, full-stack web application to efficiently manage blood donations, users, and staff with real-time data and role-based access. Built with a robust backend and a responsive React frontend using Vite. 🚀

---

## 🚦 Tech Stack

<p align="left">
  <img src="https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Express-000000?logo=express&logoColor=white" alt="Express"/>
  <img src="https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white" alt="Vite"/>
  <img src="https://img.shields.io/badge/MUI-007FFF?logo=mui&logoColor=white" alt="MUI"/>
  <img src="https://img.shields.io/badge/JWT-000000?logo=JSON%20web%20tokens&logoColor=white" alt="JWT"/>
</p>

---

## ✨ Features

- 🩸 **Blood Donation Management**: Manage donors, approvals, and rejections.
- 🔒 **Role-based Authentication**: Admin, staff, and donor roles with secure JWT login.
- 📊 **Dashboard**: Role-specific dashboards with stats on donors, blood groups, and staff.
- 📋 **User Management**: Add, update, and remove staff and donors securely.
- 📁 **Data Export**: Export donor and staff data as CSV files.
- 👩‍💻 **Responsive UI**: Clean and modern interface optimized for desktop and mobile.
- 🔍 **Search & Filter**: Quickly locate donors and staff.
- 🛠️ **Real-time updates and validations** throughout the system.

---

## 📂 Folder Structure

BloodBank-management-system/
backend/ # Node.js, Express, MongoDB API
frontend/ # React, Vite, MUI frontend


---

## 🚀 Getting Started

### 1. Clone the repository

git clone https://github.com/madhan404/BloodBank-management-system.git
cd BloodBank-management-system

### 2. Setup Backend

cd backend
npm install
npm start

#### 2.1 Configure Environment Variables

Create a `.env` file and set:

PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173


### 3. Setup Frontend

cd frontend
npm install
npm run dev


The backend runs on `http://localhost:3000` and the frontend on `http://localhost:5173` by default.

---

## 🖼️ Screenshots

### Login Page
![Login Page](frontend/public/readme-assets/login.png)

### Admin Dashboard
![Admin Dashboard](frontend/public/readme-assets/admin.png)

### Staff Dashboard
![Staff Dashboard](frontend/public/readme-assets/staff.png)

### Donor Dashboard
![Donor Dashboard](frontend/public/readme-assets/donor-dashboard.png) <!-- placeholder -->

### User Management
![User Management](frontend/public/readme-assets/user-management.png)

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 🙋‍♂️ Contact

Created by [Madhanraj S](https://github.com/madhan404) and [Deenan T](https://github.com/Dee2909) — feel free to reach out!

---

## ❤️ Live preview

[https://bloodbank-portal.netlify.app](https://bloodbank-portal.netlify.app)

<!-- Production only, use localhost for local dev -->
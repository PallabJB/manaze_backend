# 🗂️ Manaze Backend

Manaze is a task manager web application designed to help users manage their daily tasks efficiently. This repository contains the **backend** codebase of Manaze, built with Node.js, Express, and MongoDB.

---

## 🚀 Features

- User authentication with JWT
- Create, read, update, delete (CRUD) tasks
- Task categories & due dates
- Secure API with role-based access
- MongoDB for data persistence
- Error handling & validation middleware

---

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JSON Web Tokens (JWT)
- **Middleware**: Express-validator, custom error handling

---

## 📁 Folder Structure
/backend
├── controllers/ # Route handler logic
├── models/ # Mongoose schemas
├── routes/ # API route definitions
├── middlewares/ # Auth, error handlers, etc.
├── config/ # DB config and environment setup
├── utils/ # Utility functions
├── server.js # Entry point
└── .env # Environment variables

---

## 🔧 Installation

### Prerequisites

- Node.js (v14+)
- MongoDB installed or use MongoDB Atlas
- npm or yarn

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/manaze-backend.git
   cd manaze-backend
2.Install dependencies:
  npm install
3.Set up your .env file:
  PORT=5000
  MONGO_URI=your_mongo_connection_string
  JWT_SECRET=your_jwt_secret
4. Start the server:
    npm run dev

🧪 API Endpoints
Auth Routes
Method	Endpoint	Description
POST	/api/register	Register new user
POST	/api/login	Login existing user

Task Routes (Protected)
Method	Endpoint	Description
GET	/api/tasks	Get all user tasks
POST	/api/tasks	Create a new task
PUT	/api/tasks/:id	Update a specific task
DELETE	/api/tasks/:id	Delete a specific task

🛡️ Environment Variables
Create a .env file and configure the following variables:

env
Copy code
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
✅ Running in Development
bash
Copy code
npm run dev
For production:

bash
Copy code
npm start
🤝 Contributing
Fork the repository

Create your feature branch: git checkout -b feature-name

Commit your changes: git commit -m "Add some feature"

Push to the branch: git push origin feature-name

Open a pull request

📄 License
This project is licensed under the MIT License.

🌐 Frontend Repository
👉[ Manaze_Frontend](https://github.com/PallabJB/manaze_frontend)

📬 Contact
For any inquiries or feedback, feel free to reach out:

Pallab JB
📧 pallabjyotibora75@example.com



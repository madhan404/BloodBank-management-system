# Blood Bank Management System - Backend

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (running locally or cloud instance)
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Create environment file (optional)
cp .env
# Edit .env with your configuration
```

### Running the Server

#### Development Mode (with auto-restart)
```bash
npm run dev
```

#### Production Mode (with auto-restart)
```bash
npm start
```

#### Debug Mode
```bash
npm run debug
```

## ⚙️ Configuration

### Environment Variables
Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=3000
HOST=localhost
FRONTEND_URL=http://localhost:5173

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/bloodbank

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```


### Default Values
- **Port**: 3000
- **Host**: localhost
- **MongoDB**: mongodb://localhost:27017/bloodbank
- **JWT Secret**: your-secret-key (change in production!)

## 🗄️ Database Setup

### MongoDB Connection
The server will automatically connect to MongoDB with retry logic. If the connection fails, it will retry up to 5 times with 5-second intervals.

### Default Users
Create default admin and staff users:
```bash
curl -X POST http://localhost:3000/api/auth/create-admin
```

**Default Credentials:**
- **Admin**: admin@lifesave.org / admin123
- **Staff**: staff@lifesave.org / staff123

## 🔧 API Endpoints

### Health Check
- `GET /health` - Server status and uptime

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify JWT token
- `POST /api/auth/create-admin` - Create default users

### Donors
- `POST /api/donors/register` - Register new donor
- `GET /api/donors/photo/:id` - Get donor photo
- `GET /api/donors/document/:id` - Get donor document

### Staff
- `GET /api/staff/pending` - Get pending donors
- `PUT /api/staff/approve/:id` - Approve donor
- `PUT /api/staff/reject/:id` - Reject donor

### Admin
- `GET /api/admin/staff` - Get all staff
- `POST /api/admin/staff` - Add new staff
- `PUT /api/admin/staff/:id` - Update staff
- `DELETE /api/admin/staff/:id` - Delete staff
- `GET /api/admin/donors` - Get all donors
- `GET /api/admin/stats` - Get dashboard stats
- `GET /api/admin/rejected-donors` - Get rejected donors
- `DELETE /api/admin/rejected-donors/:id` - Delete rejected donor

## 📁 Project Structure

```
backend/
├── config.example.js      # Configuration template
├── server.js             # Main server file
├── package.json          # Dependencies and scripts
├── middleware/           # Custom middleware
│   └── auth.js          # JWT authentication
├── models/              # Database models
│   ├── User.js          # Staff/Admin users
│   └── Donor.js         # Donor information
├── routes/              # API routes
│   ├── auth.js          # Authentication routes
│   ├── donors.js        # Donor management
│   ├── staff.js         # Staff operations
│   └── admin.js         # Admin operations
└── uploads/             # File uploads (if using disk storage)
```

## 🛠️ Development

### Available Scripts
- `npm run dev` - Start development server with nodemon
- `npm run debug` - Start with Node.js inspector
- `npm run clean` - Clean install dependencies
- `npm run health` - Check server health

### Logging
The server includes comprehensive logging:
- Request logging with timestamps
- MongoDB connection status
- Error logging with stack traces
- Authentication attempts

### Error Handling
- Global error handler for uncaught exceptions
- MongoDB connection retry logic
- Graceful shutdown handling
- Detailed error responses in development

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration
- Request size limits
- Role-based access control

## 🚨 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process
taskkill /PID <PID> /F
```

#### MongoDB Connection Failed
- Ensure MongoDB is running
- Check connection string in .env
- Verify network connectivity

#### JWT Token Issues
- Check JWT_SECRET in .env
- Clear browser localStorage
- Verify token expiration

### Debug Mode
Run with debug flag for detailed logging:
```bash
npm run debug
```

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:3000/health
```

### Server Status
The server logs include:
- Startup information
- MongoDB connection status
- Request/response logging
- Error details

## 🔄 Updates and Maintenance

### Updating Dependencies
```bash
npm update
npm audit fix
```

### Database Migrations
Currently, the system uses Mongoose schemas that are backward compatible. For major schema changes, manual migration scripts may be required.

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Note**: This is a development setup. For production deployment, ensure proper security measures, environment variables, and monitoring are in place.

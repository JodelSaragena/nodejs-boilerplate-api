require('rootpath')();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const errorHandler = require('_middleware/error-handler');
const multer = require('multer');
const path = require('path');



// Set up Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      // Set the destination folder where the profile pictures will be saved
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      // Set the file name to be the current date/time stamp + original file extension
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });
  
  // Initialize Multer with the storage configuration
  const upload = multer({ storage: storage });
  
  // Define a POST route to handle profile picture uploads
  app.post('/save-profile-picture', upload.single('profilePicture'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
  
    // At this point, req.file contains the uploaded file information
    // You can save this information to your database or perform any other necessary operations
  
    // Send a response indicating success
    res.status(200).json({ message: 'Profile picture saved successfully', filePath: `uploads/${req.file.filename}` });
  });
  
  // Serve static files from the uploads directory
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  
  // Start the server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
/////////


// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// CORS configuration
app.use(cors({ origin: (origin, callback) => callback(null, true), credentials: true }));

// API routes
app.use('/accounts', require('./accounts/accounts.controller'));
app.use('/category', require('./category-based/category.controller'));
app.use(errorHandler);

// Start server
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000;
app.listen(port, () => console.log('Server listening on port ' + port));
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Donor = require('../models/Donor');

const router = express.Router();

// Configure multer for memory storage (to save files in DB)
const upload = multer({
  storage: multer.memoryStorage(), // Store files in memory as Buffer
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.fieldname === 'photo') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Profile photo must be an image'));
      }
    } else if (file.fieldname === 'governmentId') {
      if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Government ID must be an image or PDF'));
      }
    } else {
      cb(new Error('Invalid file field'));
    }
  }
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ message: `File upload error: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

// Register donor
router.post('/register', upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'governmentId', maxCount: 1 }
]), handleMulterError, async (req, res) => {
  try {
    console.log('Registration request received');
    console.log('Body fields:', Object.keys(req.body));
    console.log('Files received:', req.files ? Object.keys(req.files) : 'No files');
    
    const {
      fullName,
      phone,
      whatsapp,
      gmail,
      bloodGroup,
      age,
      sex,
      'address[street]': addressStreet,
      'address[city]': addressCity,
      'address[state]': addressState,
      'address[pincode]': addressPincode,
      'address[country]': addressCountry
    } = req.body;

    // Support JSON nested address as fallback
    let address = req.body.address;
    if (typeof address === 'string') {
      try { address = JSON.parse(address); } catch (_) { address = undefined; }
    }

    // Construct address from bracket notation when provided
    if (!address) {
      address = {
        street: addressStreet,
        city: addressCity,
        state: addressState,
        pincode: addressPincode,
        country: addressCountry
      };
    }

    const sanitize = (s) => (typeof s === 'string' ? s.trim() : s);

    // Sanitize scalar fields
    const sanitizedFullName = sanitize(fullName);
    const sanitizedPhone = sanitize(phone);
    const sanitizedWhatsapp = sanitize(whatsapp);
    const sanitizedGmail = sanitize(gmail);
    const sanitizedBloodGroup = sanitize(bloodGroup);
    const sanitizedSex = (sex ?? '').toString().trim().toLowerCase();

    // Trim and sanitize address
    address = {
      street: sanitize(address?.street),
      city: sanitize(address?.city),
      state: sanitize(address?.state),
      pincode: sanitize(address?.pincode),
      country: sanitize(address?.country)
    };

    const ageNumber = Number.parseInt(age, 10);

    console.log('Parsed form data:', { fullName: sanitizedFullName, phone: sanitizedPhone, bloodGroup: sanitizedBloodGroup, age: ageNumber, sex: sanitizedSex, address });

    // Validate required fields
    if (!sanitizedFullName || !sanitizedPhone || !sanitizedBloodGroup || Number.isNaN(ageNumber) || !sanitizedSex) {
      console.log('Missing required fields:', { sanitizedFullName, sanitizedPhone, sanitizedBloodGroup, ageNumber, sanitizedSex });
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    // Validate age range
    if (ageNumber < 18 || ageNumber > 65) {
      return res.status(400).json({ message: 'Age must be between 18 and 65' });
    }

    // Validate sex enum
    const allowedSex = ['male', 'female', 'other'];
    if (!allowedSex.includes(sanitizedSex)) {
      return res.status(400).json({ message: 'Invalid sex value' });
    }

    // Validate address fields
    if (!address || !address.street || !address.city || !address.state || !address.pincode || !address.country) {
      console.log('Missing address fields:', address);
      return res.status(400).json({ message: 'All address fields are required' });
    }

    if (!req.files.photo || !req.files.governmentId) {
      console.log('Missing files:', { photo: !!req.files.photo, governmentId: !!req.files.governmentId });
      return res.status(400).json({ message: 'Both photo and government ID are required' });
    }

    console.log('File info - Photo:', {
      size: req.files.photo[0].size,
      mimetype: req.files.photo[0].mimetype,
      originalname: req.files.photo[0].originalname,
      bufferLength: req.files.photo[0].buffer?.length
    });
    
    console.log('File info - Government ID:', {
      size: req.files.governmentId[0].size,
      mimetype: req.files.governmentId[0].mimetype,
      originalname: req.files.governmentId[0].originalname,
      bufferLength: req.files.governmentId[0].buffer?.length
    });

    const donor = new Donor({
      fullName: sanitizedFullName,
      phone: sanitizedPhone,
      whatsapp: sanitizedWhatsapp,
      gmail: sanitizedGmail,
      bloodGroup: sanitizedBloodGroup,
      age: ageNumber,
      sex: sanitizedSex,
      address,
      // Store file data in database
      photo: {
        data: req.files.photo[0].buffer,
        contentType: req.files.photo[0].mimetype,
        filename: req.files.photo[0].originalname
      },
      governmentId: {
        data: req.files.governmentId[0].buffer,
        contentType: req.files.governmentId[0].mimetype,
        filename: req.files.governmentId[0].originalname
      },
      // URLs will be generated after saving when we have the donor ID
      photoUrl: '',
      governmentIdUrl: '',
      status: 'pending'
    });

    console.log('Donor object created, attempting to save...');
    await donor.save();
    console.log('Donor saved successfully with ID:', donor._id);

    // Now update the URLs with the actual donor ID
    donor.photoUrl = `/api/donors/photo/${donor._id}`;
    donor.governmentIdUrl = `/api/donors/document/${donor._id}`;
    await donor.save();

    // TODO: Send SMS/Email notification
    console.log('Donor registration submitted:', donor.fullName);

    res.status(201).json({
      message: 'Donor registration submitted successfully',
      donorId: donor._id
    });
  } catch (error) {
    console.error('Donor registration error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Serve photo files from database
router.get('/photo/:id', async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor || !donor.photo || !donor.photo.data) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    res.set('Content-Type', donor.photo.contentType || 'image/jpeg');
    res.set('Content-Disposition', `inline; filename="${donor.photo.filename || 'photo'}"`);
    res.send(donor.photo.data);
  } catch (error) {
    console.error('Error serving photo:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Serve government ID documents from database
router.get('/document/:id', async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor || !donor.governmentId || !donor.governmentId.data) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.set('Content-Type', donor.governmentId.contentType || 'application/octet-stream');
    res.set('Content-Disposition', `inline; filename="${donor.governmentId.filename || 'document'}"`);
    res.send(donor.governmentId.data);
  } catch (error) {
    console.error('Error serving document:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get donor status (for donors to check their application status)
// router.get('/status/:phone', async (req, res) => {
//   try {
//     const donor = await Donor.findOne({ phone: req.params.phone })
//       .select('fullName status submittedAt approvedAt rejectionReason')
//       .lean();

//     if (!donor) {
//       return res.status(404).json({ message: 'Donor not found' });
//     }

//     res.json(donor);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

module.exports = router;
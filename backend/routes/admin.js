const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Donor = require('../models/Donor');
const auth = require('../middleware/auth');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Test route to check admin access
router.get('/test', auth, async (req, res) => {
  try {
    console.log('Admin test route accessed by user:', req.userId, 'with role:', req.userRole);
    res.json({ 
      message: 'Admin test route working',
      user: {
        id: req.userId,
        role: req.userRole,
        name: req.user?.name
      }
    });
  } catch (error) {
    console.error('Admin test route error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Helpers
 */
const toInt = (v) =>
  v !== undefined && v !== '' && !Number.isNaN(parseInt(v, 10)) ? parseInt(v, 10) : undefined;
const toFloat = (v) =>
  v !== undefined && v !== '' && !Number.isNaN(parseFloat(v)) ? parseFloat(v) : undefined;

/**
 * Get all staff members
 */
router.get('/staff', auth, async (req, res) => {
  try {
    console.log('Admin staff route accessed by user:', req.userId, 'with role:', req.userRole);
    
    if (req.userRole !== 'admin') {
      console.log('Access denied for user:', req.userId, 'role:', req.userRole);
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const staff = await User.find({ role: 'staff' })
      .select('-password')
      .sort({ createdAt: -1 });

    console.log('Staff data retrieved successfully, count:', staff.length);
    res.json(staff);
  } catch (error) {
    console.error('Admin staff route error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Add new staff member
 */
router.post('/staff', auth, async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const {
      name,
      email,
      password,
      phone,
      whatsapp,
      address,
      bloodGroup,
      age,
      sex,
      accountNumber,
      ifscCode,
      bankName,
      salary
    } = req.body;

    // Sanitize and validate sex field
    const sanitizedSex = (sex ?? '').toString().trim().toLowerCase();
    const allowedSex = ['male', 'female', 'other'];
    if (sanitizedSex && !allowedSex.includes(sanitizedSex)) {
      return res.status(400).json({ message: 'Invalid sex value. Must be male, female, or other.' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password if provided, otherwise use default
    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 12);
    } else {
      const defaultPassword = 'staff123';
      hashedPassword = await bcrypt.hash(defaultPassword, 12);
    }

    const newStaff = new User({
      name,
      email,
      password: hashedPassword,
      role: 'staff',
      phone,
      whatsapp,
      address,
      bloodGroup: bloodGroup && bloodGroup.trim() !== '' ? bloodGroup : undefined,
      age: toInt(age),
      sex: sanitizedSex,
      bankDetails: {
        accountNumber,
        ifscCode,
        bankName
      },
      salary: toFloat(salary)
    });

    await newStaff.save();

    res.status(201).json({
      message: 'Staff member added successfully',
      staff: {
        id: newStaff._id,
        name: newStaff.name,
        email: newStaff.email,
        defaultPassword
      }
    });
  } catch (error) {
    console.error('Staff creation error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationErrors 
      });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Update staff member
 */
router.put('/staff/:id', auth, async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const {
      name,
      email,
      password,
      phone,
      whatsapp,
      address,
      bloodGroup,
      age,
      sex,
      accountNumber,
      ifscCode,
      bankName,
      salary
    } = req.body;

    // If email is changing, ensure it isn't used by someone else
    if (email) {
      const exists = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (exists) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    const update = {};
    // Only allow editing name and email, other fields can be updated
    if (name !== undefined) update.name = name;
    if (email !== undefined) update.email = email;
    if (phone !== undefined) update.phone = phone;
    if (whatsapp !== undefined) update.whatsapp = whatsapp;
    if (address !== undefined) update.address = address;
    if (bloodGroup !== undefined) {
      // Only update bloodGroup if it's not an empty string
      if (bloodGroup && bloodGroup.trim() !== '') {
        update.bloodGroup = bloodGroup;
      } else {
        // Remove bloodGroup if empty string is sent
        update.bloodGroup = undefined;
      }
    }
    if (sex !== undefined) {
      // Sanitize and validate sex field
      const sanitizedSex = sex.toString().trim().toLowerCase();
      const allowedSex = ['male', 'female', 'other'];
      if (!allowedSex.includes(sanitizedSex)) {
        return res.status(400).json({ message: 'Invalid sex value. Must be male, female, or other.' });
      }
      update.sex = sanitizedSex;
    }

    const ageParsed = toInt(age);
    if (ageParsed !== undefined) update.age = ageParsed;

    const salaryParsed = toFloat(salary);
    if (salaryParsed !== undefined) update.salary = salaryParsed;

    // Update password if provided
    if (password) {
      update.password = await bcrypt.hash(password, 12);
    }

    // Nested bank details
    if (
      accountNumber !== undefined ||
      ifscCode !== undefined ||
      bankName !== undefined
    ) {
      update.bankDetails = {};
      if (accountNumber !== undefined) update.bankDetails.accountNumber = accountNumber;
      if (ifscCode !== undefined) update.bankDetails.ifscCode = ifscCode;
      if (bankName !== undefined) update.bankDetails.bankName = bankName;
    }

    const updated = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'staff' },
      { $set: update },
      { new: true }
    ).select('-password');

    if (!updated) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    res.json(updated);
  } catch (error) {
    console.error('Staff update error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationErrors 
      });
    }
    
    // Handle invalid ObjectId
    if (error?.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid staff id' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Delete staff member
 */
router.delete('/staff/:id', auth, async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const staff = await User.findOneAndDelete({
      _id: req.params.id,
      role: 'staff'
    });

    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    res.json({ message: 'Staff member deleted successfully' });
  } catch (error) {
    console.error(error);
    if (error?.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid staff id' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Get all donors
 */
router.get('/donors', auth, async (req, res) => {
  try {
    console.log('Admin donors route accessed by user:', req.userId, 'with role:', req.userRole);
    
    if (req.userRole !== 'admin') {
      console.log('Access denied for user:', req.userId, 'role:', req.userRole);
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const donors = await Donor.find()
      .populate('reviewedBy', 'name')
      .sort({ submittedAt: -1 });

    console.log('Donors data retrieved successfully, count:', donors.length);
    res.json(donors);
  } catch (error) {
    console.error('Admin donors route error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Get rejected donors only
 */
router.get('/rejected-donors', auth, async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const rejectedDonors = await Donor.find({ status: 'rejected' })
      .populate('reviewedBy', 'name')
      .sort({ submittedAt: -1 });

    res.json(rejectedDonors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Delete rejected donor
 */
router.delete('/rejected-donors/:id', auth, async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    if (donor.status !== 'rejected') {
      return res.status(400).json({ message: 'Can only delete rejected donors' });
    }

    await Donor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Rejected donor deleted successfully' });
  } catch (error) {
    console.error(error);
    if (error?.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid donor id' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Get admin dashboard stats
 */
router.get('/stats', auth, async (req, res) => {
  try {
    console.log('Admin stats route accessed by user:', req.userId, 'with role:', req.userRole);
    
    if (req.userRole !== 'admin') {
      console.log('Access denied for user:', req.userId, 'role:', req.userRole);
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const [totalStaff, totalDonors, pendingApprovals, approvedDonors, rejectedDonors] = await Promise.all([
      User.countDocuments({ role: 'staff' }),
      Donor.countDocuments(),
      Donor.countDocuments({ status: 'pending' }),
      Donor.countDocuments({ status: 'approved' }),
      Donor.countDocuments({ status: 'rejected' })
    ]);

    // Get blood group distribution for approved donors only
    const bloodGroupStats = await Donor.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Calculate percentages
    const totalApproved = approvedDonors;
    const bloodGroupPercentages = bloodGroupStats.map(bg => ({
      bloodGroup: bg._id,
      count: bg.count,
      percentage: totalApproved > 0 ? ((bg.count / totalApproved) * 100).toFixed(1) : 0
    }));

    res.json({
      totalStaff,
      totalDonors,
      approvedDonors,
      pendingApprovals,
      totalBloodUnits: approvedDonors * 2, // Assuming average 2 units per donor
      rejectedDonors,
      bloodGroupDistribution: bloodGroupPercentages
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Export data (donors or staff)
 */
router.get('/export/:type', auth, async (req, res) => {
  try {
    console.log('Export request received:', { type, userId: req.userId, userRole: req.userRole });
    
    if (req.userRole !== 'admin') {
      console.log('Access denied for export:', { userId: req.userId, userRole: req.userRole });
      return res.status(403).json({ message: 'Access denied' });
    }

    const { type } = req.params;

    // Create temp directory if it doesn't exist
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    if (type === 'donors') {
      console.log('Exporting donors data...');
      const donors = await Donor.find()
        .populate('reviewedBy', 'name')
        .select('fullName phone gmail bloodGroup age sex status submittedAt approvedAt totalDonations rejectionReason')
        .lean();

      console.log('Donors found:', donors.length);

      const csvWriter = createCsvWriter({
        path: path.join(tempDir, 'donors.csv'),
        header: [
          { id: 'fullName', title: 'Full Name' },
          { id: 'phone', title: 'Phone' },
          { id: 'gmail', title: 'Email' },
          { id: 'bloodGroup', title: 'Blood Group' },
          { id: 'age', title: 'Age' },
          { id: 'sex', title: 'Sex' },
          { id: 'status', title: 'Status' },
          { id: 'submittedAt', title: 'Submitted Date' },
          { id: 'approvedAt', title: 'Approved Date' },
          { id: 'totalDonations', title: 'Total Donations' },
          { id: 'rejectionReason', title: 'Rejection Reason' }
        ]
      });

      const formattedDonors = donors.map(donor => ({
        ...donor,
        submittedAt: donor.submittedAt ? new Date(donor.submittedAt).toLocaleDateString() : '',
        approvedAt: donor.approvedAt ? new Date(donor.approvedAt).toLocaleDateString() : ''
      }));

      console.log('Formatted donors for CSV:', formattedDonors.length);
      await csvWriter.writeRecords(formattedDonors);

      const filePath = path.join(tempDir, 'donors.csv');
      console.log('Sending donors CSV file:', filePath);
      res.download(filePath, 'donors.csv', (err) => {
        if (!err) {
          console.log('Donors CSV sent successfully, cleaning up file');
          fs.unlinkSync(filePath);
        } else {
          console.error('Error sending donors CSV:', err);
        }
      });

    } else if (type === 'staff') {
      console.log('Exporting staff data...');
      const staff = await User.find({ role: 'staff' })
        .select('name email phone whatsapp bloodGroup age sex salary createdAt')
        .lean();

      console.log('Staff found:', staff.length);

      const csvWriter = createCsvWriter({
        path: path.join(tempDir, 'staff.csv'),
        header: [
          { id: 'name', title: 'Name' },
          { id: 'email', title: 'Email' },
          { id: 'phone', title: 'Phone' },
          { id: 'whatsapp', title: 'WhatsApp' },
          { id: 'bloodGroup', title: 'Blood Group' },
          { id: 'age', title: 'Age' },
          { id: 'sex', title: 'Sex' },
          { id: 'salary', title: 'Salary' },
          { id: 'createdAt', title: 'Join Date' }
        ]
      });

      const formattedStaff = staff.map(member => ({
        ...member,
        createdAt: member.createdAt ? new Date(member.createdAt).toLocaleDateString() : ''
      }));

      console.log('Formatted staff for CSV:', formattedStaff.length);
      await csvWriter.writeRecords(formattedStaff);

      const filePath = path.join(tempDir, 'staff.csv');
      res.download(filePath, 'staff.csv', (err) => {
        if (!err) fs.unlinkSync(filePath);
      });

    } else {
      res.status(400).json({ message: 'Invalid export type' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

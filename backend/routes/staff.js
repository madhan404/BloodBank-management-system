const express = require('express');
const Donor = require('../models/Donor');
const auth = require('../middleware/auth');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Get pending donors for approval
router.get('/pending-donors', auth, async (req, res) => {
  try {
    if (req.userRole !== 'staff' && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const pendingDonors = await Donor.find({ status: 'pending' })
      .sort({ submittedAt: -1 });

    res.json(pendingDonors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get approved donors
router.get('/approved-donors', auth, async (req, res) => {
  try {
    if (req.userRole !== 'staff' && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const approvedDonors = await Donor.find({ status: 'approved' })
      .sort({ approvedAt: -1 });

    res.json(approvedDonors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve donor
router.post('/approve-donor/:id', auth, async (req, res) => {
  try {
    if (req.userRole !== 'staff' && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const donor = await Donor.findByIdAndUpdate(
      req.params.id,
      {
        status: 'approved',
        approvedAt: new Date(),
        reviewedBy: req.userId,
        reviewedAt: new Date()
      },
      { new: true }
    );

    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    // TODO: Send approval notification SMS/Email
    console.log('Donor approved:', donor.fullName);

    res.json({ message: 'Donor approved successfully', donor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject donor
router.post('/reject-donor/:id', auth, async (req, res) => {
  try {
    if (req.userRole !== 'staff' && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { reason } = req.body;

    const donor = await Donor.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rejected',
        rejectionReason: reason,
        reviewedBy: req.userId,
        reviewedAt: new Date()
      },
      { new: true }
    );

    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    // TODO: Send rejection notification SMS/Email
    console.log('Donor rejected:', donor.fullName, 'Reason:', reason);

    res.json({ message: 'Donor rejected', donor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get staff dashboard stats
router.get('/stats', auth, async (req, res) => {
  try {
    if (req.userRole !== 'staff' && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [pendingCount, approvedTodayCount, totalDonorsCount] = await Promise.all([
      Donor.countDocuments({ status: 'pending' }),
      Donor.countDocuments({ 
        status: 'approved',
        approvedAt: { $gte: today }
      }),
      Donor.countDocuments({ status: 'approved' })
    ]);

    res.json({
      pendingReviews: pendingCount,
      approvedToday: approvedTodayCount,
      totalDonors: totalDonorsCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export donors data as CSV
router.get('/export-donors', auth, async (req, res) => {
  try {
    if (req.userRole !== 'staff' && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const donors = await Donor.find({ status: 'approved' })
      .select('fullName phone gmail bloodGroup age sex approvedAt totalDonations')
      .lean();

    const csvWriter = createCsvWriter({
      path: path.join(__dirname, '../temp/donors.csv'),
      header: [
        { id: 'fullName', title: 'Full Name' },
        { id: 'phone', title: 'Phone' },
        { id: 'gmail', title: 'Email' },
        { id: 'bloodGroup', title: 'Blood Group' },
        { id: 'age', title: 'Age' },
        { id: 'sex', title: 'Sex' },
        { id: 'approvedAt', title: 'Approved Date' },
        { id: 'totalDonations', title: 'Total Donations' }
      ]
    });

    // Create temp directory if it doesn't exist
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const formattedDonors = donors.map(donor => ({
      ...donor,
      approvedAt: donor.approvedAt ? new Date(donor.approvedAt).toLocaleDateString() : ''
    }));

    await csvWriter.writeRecords(formattedDonors);

    const filePath = path.join(__dirname, '../temp/donors.csv');
    res.download(filePath, 'donors.csv', (err) => {
      if (!err) {
        // Delete the file after sending
        fs.unlinkSync(filePath);
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
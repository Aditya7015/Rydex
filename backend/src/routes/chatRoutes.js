const express = require('express');
const Chat = require('../models/Chat');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const chats = await Chat.find({
      isActive: true,
      $or: [{ driverId: req.user.id }, { passengerId: req.user.id }]
    })
      .populate('rideId', 'from to date departureTime')
      .populate('driverId', 'name profilePhoto')
      .populate('passengerId', 'name profilePhoto')
      .sort({ lastMessageAt: -1 });

    res.status(200).json({ success: true, chats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate('rideId', 'from to date departureTime')
      .populate('driverId', 'name profilePhoto')
      .populate('passengerId', 'name profilePhoto')
      .populate('messages.senderId', 'name profilePhoto');

    if (!chat) {
      return res.status(404).json({ success: false, error: 'Chat not found' });
    }

    const userId = req.user.id;
    const isParticipant =
      chat.driverId._id.toString() === userId ||
      chat.passengerId._id.toString() === userId;

    if (!isParticipant) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    res.status(200).json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

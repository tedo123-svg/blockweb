import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import connectDB from './config/database.js';
import User from './models/User.js';
import Report from './models/Report.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(join(__dirname, 'uploads')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'server/uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Auth middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Initialize default users if database is empty
const initializeUsers = async () => {
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    await User.create([
      {
        username: 'woreda1',
        password: bcrypt.hashSync('password123', 10),
        role: 'woreda',
        woredaName: 'Woreda 1',
        subCity: 'Sub-City A',
        status: 'active'
      },
      {
        username: 'subcity',
        password: bcrypt.hashSync('admin123', 10),
        role: 'subcity',
        status: 'active'
      }
    ]);
    console.log('Default users created');
  }
};

initializeUsers();

// Routes
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    if (user.status === 'inactive') {
      return res.status(403).json({ error: 'Account is inactive' });
    }
    
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role, woredaName: user.woredaName },
      JWT_SECRET
    );
    
    res.json({
      token,
      user: {
        username: user.username,
        role: user.role,
        woredaName: user.woredaName,
        subCity: user.subCity
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/reports', authenticate, upload.array('attachments', 5), async (req, res) => {
  try {
    if (req.user.role !== 'woreda') {
      return res.status(403).json({ error: 'Only Woreda users can submit reports' });
    }
    
    const report = await Report.create({
      ...req.body,
      maleParticipants: parseInt(req.body.maleParticipants),
      femaleParticipants: parseInt(req.body.femaleParticipants),
      totalParticipants: parseInt(req.body.totalParticipants),
      attachments: req.files?.map(f => f.filename) || [],
      submittedBy: req.user.username
    });
    
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/reports', authenticate, async (req, res) => {
  try {
    const { startDate, endDate, topic, woreda } = req.query;
    let query = {};
    
    if (req.user.role === 'woreda') {
      query.submittedBy = req.user.username;
    }
    
    if (startDate) query.discussionDate = { $gte: startDate };
    if (endDate) query.discussionDate = { ...query.discussionDate, $lte: endDate };
    if (topic) query.mainTopic = { $regex: topic, $options: 'i' };
    if (woreda) query.woredaName = woreda;
    
    const reports = await Report.find(query).sort({ submittedAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/statistics', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'subcity') {
      return res.status(403).json({ error: 'Only Sub-City can view statistics' });
    }
    
    const reports = await Report.find();
    const totalDiscussions = reports.length;
    const totalMale = reports.reduce((sum, r) => sum + r.maleParticipants, 0);
    const totalFemale = reports.reduce((sum, r) => sum + r.femaleParticipants, 0);
    const totalParticipants = totalMale + totalFemale;
    
    const topicCounts = {};
    reports.forEach(r => {
      topicCounts[r.mainTopic] = (topicCounts[r.mainTopic] || 0) + 1;
    });
    
    res.json({
      totalDiscussions,
      totalParticipants,
      totalMale,
      totalFemale,
      topicCounts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User management routes
app.get('/api/users', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'subcity') {
      return res.status(403).json({ error: 'Only Sub-City can manage users' });
    }
    
    const users = await User.find({ role: 'woreda' }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'subcity') {
      return res.status(403).json({ error: 'Only Sub-City can create users' });
    }
    
    const { username, password, woredaName, subCity } = req.body;
    
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    const user = await User.create({
      username,
      password: bcrypt.hashSync(password, 10),
      role: 'woreda',
      woredaName,
      subCity,
      status: 'active'
    });
    
    res.status(201).json({
      id: user._id,
      username: user.username,
      woredaName: user.woredaName,
      subCity: user.subCity,
      status: user.status
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'subcity') {
      return res.status(403).json({ error: 'Only Sub-City can update users' });
    }
    
    const { woredaName, subCity, status, password } = req.body;
    const updateData = { woredaName, subCity, status };
    
    if (password) {
      updateData.password = bcrypt.hashSync(password, 10);
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/users/:id', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'subcity') {
      return res.status(403).json({ error: 'Only Sub-City can delete users' });
    }
    
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

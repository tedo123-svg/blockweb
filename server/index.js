import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 5000;
const JWT_SECRET = 'your-secret-key-change-in-production';

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(join(__dirname, 'uploads')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'server/uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// In-memory storage (replace with database in production)
let users = [
  { id: 1, username: 'woreda1', password: bcrypt.hashSync('password123', 10), role: 'woreda', woredaName: 'Woreda 1', subCity: 'Sub-City A', status: 'active' },
  { id: 2, username: 'subcity', password: bcrypt.hashSync('admin123', 10), role: 'subcity', status: 'active' }
];
let reports = [];
let reportIdCounter = 1;
let userIdCounter = 3;

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

// Routes
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  console.log('[LOGIN ATTEMPT]', username, password);
  const user = users.find(u => u.username === username);
  
  if (!user || !bcrypt.compareSync(password, user.password)) {
    console.log('[LOGIN FAILED]', username);
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  if (user.status === 'inactive') {
    return res.status(403).json({ error: 'Account is inactive' });
  }
  
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role, woredaName: user.woredaName }, JWT_SECRET);
  res.json({ token, user: { username: user.username, role: user.role, woredaName: user.woredaName, subCity: user.subCity } });
});

app.post('/api/reports', authenticate, upload.array('attachments', 5), (req, res) => {
  if (req.user.role !== 'woreda') {
    return res.status(403).json({ error: 'Only Woreda users can submit reports' });
  }
  
  const report = {
    id: reportIdCounter++,
    ...req.body,
    maleParticipants: parseInt(req.body.maleParticipants),
    femaleParticipants: parseInt(req.body.femaleParticipants),
    totalParticipants: parseInt(req.body.totalParticipants),
    attachments: req.files?.map(f => f.filename) || [],
    submittedBy: req.user.username,
    submittedAt: new Date().toISOString()
  };
  
  reports.push(report);
  res.status(201).json(report);
});

app.get('/api/reports', authenticate, (req, res) => {
  const { startDate, endDate, topic, woreda } = req.query;
  let filtered = reports;
  
  if (req.user.role === 'woreda') {
    filtered = filtered.filter(r => r.submittedBy === req.user.username);
  }
  
  if (startDate) filtered = filtered.filter(r => r.discussionDate >= startDate);
  if (endDate) filtered = filtered.filter(r => r.discussionDate <= endDate);
  if (topic) filtered = filtered.filter(r => r.mainTopic.toLowerCase().includes(topic.toLowerCase()));
  if (woreda) filtered = filtered.filter(r => r.woredaName === woreda);
  
  res.json(filtered);
});

app.get('/api/statistics', authenticate, (req, res) => {
  if (req.user.role !== 'subcity') {
    return res.status(403).json({ error: 'Only Sub-City can view statistics' });
  }
  
  const totalDiscussions = reports.length;
  const totalMale = reports.reduce((sum, r) => sum + r.maleParticipants, 0);
  const totalFemale = reports.reduce((sum, r) => sum + r.femaleParticipants, 0);
  const totalParticipants = totalMale + totalFemale; // Calculate from male + female for accuracy
  
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
});

// User management routes
app.get('/api/users', authenticate, (req, res) => {
  if (req.user.role !== 'subcity') {
    return res.status(403).json({ error: 'Only Sub-City can manage users' });
  }
  
  const userList = users.filter(u => u.role === 'woreda').map(u => ({
    id: u.id,
    username: u.username,
    woredaName: u.woredaName,
    subCity: u.subCity,
    status: u.status
  }));
  
  res.json(userList);
});

app.post('/api/users', authenticate, (req, res) => {
  if (req.user.role !== 'subcity') {
    return res.status(403).json({ error: 'Only Sub-City can create users' });
  }
  
  const { username, password, woredaName, subCity } = req.body;
  
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Username already exists' });
  }
  
  const newUser = {
    id: userIdCounter++,
    username,
    password: bcrypt.hashSync(password, 10),
    role: 'woreda',
    woredaName,
    subCity,
    status: 'active'
  };
  
  users.push(newUser);
  res.status(201).json({ id: newUser.id, username, woredaName, subCity, status: 'active' });
});

app.put('/api/users/:id', authenticate, (req, res) => {
  if (req.user.role !== 'subcity') {
    return res.status(403).json({ error: 'Only Sub-City can update users' });
  }
  
  const userId = parseInt(req.params.id);
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const { woredaName, subCity, status, password } = req.body;
  
  if (woredaName) user.woredaName = woredaName;
  if (subCity) user.subCity = subCity;
  if (status) user.status = status;
  if (password) user.password = bcrypt.hashSync(password, 10);
  
  res.json({ id: user.id, username: user.username, woredaName: user.woredaName, subCity: user.subCity, status: user.status });
});

app.delete('/api/users/:id', authenticate, (req, res) => {
  if (req.user.role !== 'subcity') {
    return res.status(403).json({ error: 'Only Sub-City can delete users' });
  }
  
  const userId = parseInt(req.params.id);
  const index = users.findIndex(u => u.id === userId);
  
  if (index === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  users.splice(index, 1);
  res.json({ message: 'User deleted successfully' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

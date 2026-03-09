import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://your-project.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || 'your-service-role-key'
);

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

// Routes
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error || !user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    if (user.status === 'inactive') {
      return res.status(403).json({ error: 'Account is inactive' });
    }
    
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, woredaName: user.woreda_name },
      JWT_SECRET
    );
    
    res.json({
      token,
      user: {
        username: user.username,
        role: user.role,
        woredaName: user.woreda_name,
        subCity: user.sub_city
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
    
    const reportData = {
      woreda_name: req.body.woredaName,
      sub_city: req.body.subCity,
      discussion_date: req.body.discussionDate,
      location: req.body.location,
      facilitator_name: req.body.facilitatorName,
      total_participants: parseInt(req.body.totalParticipants),
      male_participants: parseInt(req.body.maleParticipants),
      female_participants: parseInt(req.body.femaleParticipants),
      main_topic: req.body.mainTopic,
      description: req.body.description,
      positive_ideas: req.body.positiveIdeas,
      negative_issues: req.body.negativeIssues,
      recommendations: req.body.recommendations,
      attachments: req.files?.map(f => f.filename) || [],
      submitted_by: req.user.username
    };
    
    const { data, error } = await supabase
      .from('reports')
      .insert([reportData])
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/reports', authenticate, async (req, res) => {
  try {
    const { startDate, endDate, topic, woreda } = req.query;
    
    let query = supabase.from('reports').select('*');
    
    if (req.user.role === 'woreda') {
      query = query.eq('submitted_by', req.user.username);
    }
    
    if (startDate) query = query.gte('discussion_date', startDate);
    if (endDate) query = query.lte('discussion_date', endDate);
    if (topic) query = query.ilike('main_topic', `%${topic}%`);
    if (woreda) query = query.eq('woreda_name', woreda);
    
    const { data, error } = await query.order('submitted_at', { ascending: false });
    
    if (error) throw error;
    
    // Convert snake_case to camelCase for frontend
    const reports = data.map(r => ({
      id: r.id,
      woredaName: r.woreda_name,
      subCity: r.sub_city,
      discussionDate: r.discussion_date,
      location: r.location,
      facilitatorName: r.facilitator_name,
      totalParticipants: r.total_participants,
      maleParticipants: r.male_participants,
      femaleParticipants: r.female_participants,
      mainTopic: r.main_topic,
      description: r.description,
      positiveIdeas: r.positive_ideas,
      negativeIssues: r.negative_issues,
      recommendations: r.recommendations,
      attachments: r.attachments,
      submittedBy: r.submitted_by,
      submittedAt: r.submitted_at
    }));
    
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
    
    const { data: reports, error } = await supabase
      .from('reports')
      .select('*');
    
    if (error) throw error;
    
    const totalDiscussions = reports.length;
    const totalMale = reports.reduce((sum, r) => sum + r.male_participants, 0);
    const totalFemale = reports.reduce((sum, r) => sum + r.female_participants, 0);
    const totalParticipants = totalMale + totalFemale;
    
    const topicCounts = {};
    reports.forEach(r => {
      topicCounts[r.main_topic] = (topicCounts[r.main_topic] || 0) + 1;
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
    
    const { data, error } = await supabase
      .from('users')
      .select('id, username, woreda_name, sub_city, status')
      .eq('role', 'woreda');
    
    if (error) throw error;
    
    const users = data.map(u => ({
      id: u.id,
      username: u.username,
      woredaName: u.woreda_name,
      subCity: u.sub_city,
      status: u.status
    }));
    
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
    
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();
    
    if (existing) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    const { data, error } = await supabase
      .from('users')
      .insert([{
        username,
        password: bcrypt.hashSync(password, 10),
        role: 'woreda',
        woreda_name: woredaName,
        sub_city: subCity,
        status: 'active'
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json({
      id: data.id,
      username: data.username,
      woredaName: data.woreda_name,
      subCity: data.sub_city,
      status: data.status
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
    const updateData = {
      woreda_name: woredaName,
      sub_city: subCity,
      status,
      updated_at: new Date().toISOString()
    };
    
    if (password) {
      updateData.password = bcrypt.hashSync(password, 10);
    }
    
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      id: data.id,
      username: data.username,
      woredaName: data.woreda_name,
      subCity: data.sub_city,
      status: data.status
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/users/:id', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'subcity') {
      return res.status(403).json({ error: 'Only Sub-City can delete users' });
    }
    
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

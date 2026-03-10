import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import fs from 'fs';
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

// Ensure storage bucket exists (public so frontend can download attachments)
const STORAGE_BUCKET = 'report-attachments';
(async () => {
  const { data: existing, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    console.warn('Unable to list Supabase storage buckets', listError);
    return;
  }

  const hasBucket = existing.some(b => b.name === STORAGE_BUCKET);
  if (!hasBucket) {
    const { error } = await supabase.storage.createBucket(STORAGE_BUCKET, {
      public: true
    });
    if (error) {
      console.warn('Unable to create Supabase storage bucket:', error);
    }
  }
})();

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://localhost:3000', 
    /\.netlify\.app$/,
    /\.vercel\.app$/,
    /\.github\.io$/
  ],
  credentials: true
}));
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
    
      // Upload attachments to Supabase Storage and store public URLs.
    const attachments = [];

    if (req.files?.length) {
      await Promise.all(req.files.map(async (file) => {
        const storagePath = `${req.user.username}/${Date.now()}-${file.originalname}`;

        // Upload to Supabase storage
        const { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(storagePath, fs.createReadStream(file.path), {
            upsert: true
          });

        if (uploadError) {
          console.warn('Supabase storage upload error:', uploadError);
          return;
        }

        // Get public URL for the uploaded file
        const { data: publicUrlData } = supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(storagePath);

        if (publicUrlData?.publicUrl) {
          attachments.push(publicUrlData.publicUrl);
        }

        // Cleanup local temp file
        fs.unlink(file.path, () => {});
      }));
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
      submitted_by: req.user.username
    };
    
    const { data, error } = await supabase
      .from('reports')
      .insert([reportData])
      .select()
      .single();
    
    if (error) throw error;

    // Store attachments in their own table to make them queryable.
    if (attachments.length && data?.id) {
      const attachmentRows = attachments.map(url => ({
        report_id: data.id,
        url,
        filename: url.split('/').pop()
      }));

      const { error: attachError } = await supabase
        .from('report_attachments')
        .insert(attachmentRows);

      if (attachError) {
        console.warn('Failed to insert attachments:', attachError);
      }
    }
    
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

    const reportIds = data.map(r => r.id);
    let attachmentsByReport = {};

    if (reportIds.length > 0) {
      const { data: attachmentRows } = await supabase
        .from('report_attachments')
        .select('*')
        .in('report_id', reportIds);

      attachmentsByReport = attachmentRows?.reduce((acc, row) => {
        acc[row.report_id] = acc[row.report_id] || [];
        acc[row.report_id].push(row.url);
        return acc;
      }, {}) || {};
    }
    
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
      attachments: attachmentsByReport[r.id] || [],
      submittedBy: r.submitted_by,
      submittedAt: r.submitted_at
    }));
    
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Allow Woreda users to delete their own reports (and allow Sub-City to delete any)
app.delete('/api/reports/:id', authenticate, async (req, res) => {
  try {
    const reportId = req.params.id;
    const { data: report, error: fetchError } = await supabase
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (fetchError || !report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    if (req.user.role === 'woreda' && report.submitted_by !== req.user.username) {
      return res.status(403).json({ error: 'Not allowed to delete this report' });
    }

    // Delete the stored attachment files as well
    const { data: attachments } = await supabase
      .from('report_attachments')
      .select('url')
      .eq('report_id', reportId);

    const pathsToRemove = (attachments || [])
      .map(a => {
        const match = a.url.match(/\/storage\/v1\/object\/public\/[\w-]+\/(.+)$/);
        return match ? match[1] : null;
      })
      .filter(Boolean);

    if (pathsToRemove.length) {
      const { error: removeError } = await supabase
        .storage.from(STORAGE_BUCKET)
        .remove(pathsToRemove);

      if (removeError) {
        console.warn('Failed to remove attachment files from storage:', removeError);
      }
    }

    const { error: deleteError } = await supabase
      .from('reports')
      .delete()
      .eq('id', reportId);

    if (deleteError) throw deleteError;

    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Allow users to change their own password
app.put('/api/users/me/password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new passwords are required' });
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!bcrypt.compareSync(currentPassword, user.password)) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({ password: bcrypt.hashSync(newPassword, 10), updated_at: new Date().toISOString() })
      .eq('id', req.user.id);

    if (updateError) throw updateError;

    res.json({ message: 'Password updated successfully' });
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

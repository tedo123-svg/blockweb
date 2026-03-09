import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  woredaName: { type: String, required: true },
  subCity: { type: String },
  discussionDate: { type: String, required: true },
  location: { type: String, required: true },
  facilitatorName: { type: String, required: true },
  totalParticipants: { type: Number, required: true },
  maleParticipants: { type: Number, required: true },
  femaleParticipants: { type: Number, required: true },
  mainTopic: { type: String, required: true },
  description: { type: String, required: true },
  positiveIdeas: { type: String },
  negativeIssues: { type: String },
  recommendations: { type: String },
  attachments: [{ type: String }],
  submittedBy: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Report', reportSchema);

import mongoose from 'mongoose';
import { TICKET_PRIORITY } from '../config/constants.js';

const slaRuleSchema = new mongoose.Schema(
  {
    priority: {
      type: String,
      enum: Object.values(TICKET_PRIORITY),
      required: [true, 'Priority level is required for SLA rule'],
      unique: true,
      index: true,
    },
    responseDeadlineMinutes: {
      type: Number,
      required: [true, 'Response deadline in minutes is required'],
      min: [1, 'Response deadline must be at least 1 minute'],
    },
    resolutionDeadlineMinutes: {
      type: Number,
      required: [true, 'Resolution deadline in minutes is required'],
      min: [1, 'Resolution deadline must be at least 1 minute'],
    },
    warningThresholdPercent: {
      type: Number,
      default: 80,
      min: [10, 'Warning threshold must be at least 10%'],
      max: [99, 'Warning threshold cannot exceed 99%'],
    },
    description: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const SLARule = mongoose.model('SLARule', slaRuleSchema);
export default SLARule;

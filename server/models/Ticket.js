import mongoose from 'mongoose';
import { TICKET_STATUS, TICKET_PRIORITY, SLA_STATUS } from '../config/constants.js';

const attachmentSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const ticketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Ticket title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Ticket description is required'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Ticket category is required'],
      index: true,
    },
    priority: {
      type: String,
      enum: Object.values(TICKET_PRIORITY),
      default: TICKET_PRIORITY.MEDIUM,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(TICKET_STATUS),
      default: TICKET_STATUS.OPEN,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    attachments: [attachmentSchema],
    sla: {
      rule: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SLARule',
      },
      responseDeadline: {
        type: Date,
        index: true,
      },
      resolutionDeadline: {
        type: Date,
        index: true,
      },
      firstRespondedAt: {
        type: Date,
      },
      responseStatus: {
        type: String,
        enum: Object.values(SLA_STATUS),
        default: SLA_STATUS.PENDING,
      },
      resolutionStatus: {
        type: String,
        enum: Object.values(SLA_STATUS),
        default: SLA_STATUS.PENDING,
      },
      warningTriggered: {
        type: Boolean,
        default: false,
      },
      isBreached: {
        type: Boolean,
        default: false,
        index: true,
      },
    },
    escalation: {
      isEscalated: {
        type: Boolean,
        default: false,
        index: true,
      },
      escalatedAt: {
        type: Date,
      },
      reason: {
        type: String,
        default: '',
      },
      escalatedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },
    resolvedAt: {
      type: Date,
    },
    closedAt: {
      type: Date,
    },
    reopenedCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for optimal dashboard & filter query performance
ticketSchema.index({ createdBy: 1, status: 1 });
ticketSchema.index({ assignedTo: 1, status: 1 });
ticketSchema.index({ status: 1, priority: 1 });
ticketSchema.index({ 'sla.isBreached': 1, status: 1 });
ticketSchema.index({ createdAt: -1 });

const Ticket = mongoose.model('Ticket', ticketSchema);
export default Ticket;

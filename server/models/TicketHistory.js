import mongoose from 'mongoose';
import { HISTORY_ACTIONS } from '../config/constants.js';

const ticketHistorySchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: [true, 'Ticket reference is required'],
      index: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Actor user is required'],
    },
    action: {
      type: String,
      enum: Object.values(HISTORY_ACTIONS),
      required: [true, 'Action type is required'],
    },
    previousValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    details: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false, // Explicit immutable event timestamp used
  }
);

const TicketHistory = mongoose.model('TicketHistory', ticketHistorySchema);
export default TicketHistory;

import * as commentService from '../services/commentService.js';
import * as historyService from '../services/historyService.js';

export const getTicketComments = async (req, res, next) => {
  try {
    const comments = await commentService.getTicketComments(req.params.id, req.user);
    res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const message = req.body.message || req.body.content;
    const { isInternal } = req.body;
    const attachments = (req.files || []).map((file) => ({
      fileName: file.originalname,
      fileUrl: `/uploads/${file.filename}`,
      fileType: file.mimetype,
      fileSize: file.size,
    }));

    const comment = await commentService.addComment(
      req.params.id,
      { message, isInternal, attachments },
      req.user
    );

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: comment,
    });
  } catch (error) {
    next(error);
  }
};

export const getTicketHistory = async (req, res, next) => {
  try {
    const history = await historyService.getTicketHistory(req.params.id);
    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

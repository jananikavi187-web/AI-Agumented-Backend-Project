const { Schema, model, Types } = require('mongoose');

const commentSchema = new Schema(
  {
    text: {
      type: String,
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
      required: [true, 'Comment text is required'],
    },
    blog: {
      type: Types.ObjectId,
      ref: 'Blog',
      required: true,
    },
    author: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorName: {
      type: String,
      trim: true,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = model('Comment', commentSchema);

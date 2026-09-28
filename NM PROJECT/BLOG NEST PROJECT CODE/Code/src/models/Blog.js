const { Schema, model, Types } = require('mongoose');

const blogSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, 'Title is required'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    category: {
      type: String,
      trim: true,
      required: [true, 'Category is required'],
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

module.exports = model('Blog', blogSchema);

const express = require("express");
const ObjectId = require('mongoose').Types.ObjectId;

const Task = require("../models/Tasks");
const User = require("../models/Users");
const Comment = require("../models/Comments");
const Activities = require("../models/Activities");

const getComments = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate({
      path: "comments",
      populate: {
        path: "commenter",
        select: "fullName username email avatar _id",
      },
    });

    const result = task.comments.sort((a, b) => a.createdAt > b.createdAt);

    res.status(200).json({
      comments: result
    });
  } catch (err) {
    console.error(err.message);
    res.status(400).send("Error getting comment");
  }
};

const addComment = async (req, res) => {
  const { content } = req.body;

  try {
    const userId = new ObjectId(req.user.id);
    const user = await User.findById(userId);

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Tạo Comment mới
    const comment = new Comment({
      content,
      commenter: userId,
    });

    const savedComment = await comment.save();

    task.comments.push(savedComment._id);

    const newComment = await Comment.findById(savedComment._id)
      .populate({
        path: "commenter",
        select: "fullName username email avatar _id",
      });

    const activity = new Activities({
      userId,
      action: {
        actionType: 'comment',
        from: {},
        to: {
          comment: newComment
        }
      }
    })

    activity.markModified('action');
    await activity.save();

    if (task.activities?.length > 0) {
      task.activities.unshift(activity._id);
    } else {
      task.activities.push(activity._id);
    }

    await task.save();
    return res.status(201).json({
      message: 'Comment added successfully',
      comment: savedComment
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message || "Error adding comment" });
  }
};
const deleteComment = async (req, res) => {
  const { id, commentid } = req.params;

  try {
    const userId = new ObjectId(req.user.id);
    const user = await User.findById(userId);
    // Lấy Task theo ID
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Xóa comment trong comments
    const comment = await Comment.findByIdAndDelete(commentid);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Xóa comment trong task
    const index = task.comments.indexOf(comment._id);
    if (index > -1) {
      task.comments.splice(index, 1);
    }
    
    await task.save();

    const newTask = await Task.findById(task._id)
      .populate({
        path: 'comments',
        options: { allowEmptyArray: true },
        populate: {
          path: 'commenter',
          select: '_id fullName email avatar username'
        }
      });

    // Trả về thông tin Comment đã bị xóa
    return res.status(200).json({
      message: 'Comment deleted successfully',
      task: newTask
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message || "server error" });
  }
};
const updateComment = async (req, res) => {
  try {
    const { content } = req.body;
    const comment = await Comment.findByIdAndUpdate(req.params.commentid, { content }, { new: true }); // {new:true} nó sẽ trả về commnet sau khi được cập nhật

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    res.json(comment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
module.exports = { addComment, getComments, deleteComment,updateComment };

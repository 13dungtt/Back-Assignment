const express = require("express");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");
const mongoose = require("mongoose");
const router = express.Router();

// GET /comments/:id - Fetch all comments by a user
router.get("/:id", async (request, response) => {
  try {
    const userId = request.params.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return response.status(400).json({ message: "Invalid user ID" });
    }
    const user = await User.findById(userId).exec();

    if (!user) {
      return response.status(400).json({ message: "User not found" });
    }

    // Find photos with comments by this user
    const photos = await Photo.find({
      "comments.user_id": userId,
    })
      .select({
        _id: 1,
        file_name: 1,
        comments: 1,
      })
      .exec();

    // Extract comments by the user
    const userComments = [];
    photos.forEach((photo) => {
      photo.comments.forEach((comment) => {
        if (comment.user_id.toString() === userId) {
          userComments.push({
            _id: comment._id,
            comment: comment.comment,
            date_time: comment.date_time,
            photo: {
              _id: photo._id,
              file_name: photo.file_name,
            },
          });
        }
      });
    });
    response.json(userComments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    response.status(500).json({ message: "Internal server error" });
  }
});

router.post("/commentsOfPhoto/:photo_id", async (request, response) => {
  try {
    const photoID = request.params.photo_id; // đúng cú pháp
    const { comment } = request.body;

    const photo = await Photo.findById(photoID);

    if (!photo) {
      return response.status(404).json({ message: "Photo not found" });
    }

    const newComment = {
      comment: comment,
      user_id: photo.user_id, // bạn có thể thay bằng req.session.user_id nếu có đăng nhập
      date_time: new Date(),
    };

    photo.comments.push(newComment);
    await photo.save(); // <-- rất quan trọng

    console.log("Added comment:", newComment);

    response.status(200).json({ message: "Comment added successfully" });
  } catch (error) {
    console.error("Error adding comment:", error);
    response.status(500).json({ message: "Internal server error" });
  }
});


module.exports = router;

const express = require("express");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");
const mongoose = require("mongoose");
const router = express.Router();

router.post("/", async (request, response) => {
  // POST not required by assignment; left empty
});

router.get("/photosOfUser/:id", async (request, response) => {
  try {
    const userId = request.params.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return response.status(400).json({ message: "Invalid user ID" });
    }
    const user = await User.findById(userId).exec();
    if (!user) {
      return response.status(400).json({ message: "User not found" });
    }

    const photos = await Photo.find({ user_id: userId }).select({
      _id: 1,
      user_id: 1,
      file_name: 1,
      date_time: 1,
      comments: 1,
    }).exec();

    const responsePhotos = photos.map((photo) => ({
      _id: photo._id,
      user_id: photo.user_id,
      file_name: photo.file_name,
      date_time: photo.date_time,
      comments: photo.comments.map((comment) => ({
        _id: comment._id,
        comment: comment.comment,
        date_time: comment.date_time,
        user: { _id: comment.user_id }, // Placeholder; user details added below
      })),
    }));

    // Collect unique user IDs from comments
    const commentUserIds = new Set();
    photos.forEach((photo) => {
      photo.comments.forEach((comment) => {
        if (mongoose.Types.ObjectId.isValid(comment.user_id)) {
          commentUserIds.add(comment.user_id.toString());
        }
      });
    });

    // Fetch user details for comment authors
    const commentUsers = await User.find({
      _id: { $in: Array.from(commentUserIds) },
    }).select({
      _id: 1,
      first_name: 1,
      last_name: 1,
    }).exec();

    const userMap = commentUsers.reduce((map, user) => {
      map[user._id.toString()] = user;
      return map;
    }, {});

    // Add user details to comments
    responsePhotos.forEach((photo) => {
      photo.comments.forEach((comment) => {
        const user = userMap[comment.user._id.toString()];
        comment.user = user
          ? {
              _id: user._id,
              first_name: user.first_name,
              last_name: user.last_name,
            }
          : {
              _id: comment.user._id,
              first_name: "Unknown",
              last_name: "",
            };
      });
    });

    response.json(responsePhotos);
  } catch (error) {
    console.error("Error fetching photos:", error);
    response.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
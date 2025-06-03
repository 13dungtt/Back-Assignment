const express = require("express");
const User = require("../db/userModel");
const mongoose = require("mongoose");
const router = express.Router();
const session = require("express-session");


router.post("/", async (request, response) => {
  // POST not required by assignment; left empty
});

router.get("/list", async (request, response) => {
  try {
    const users = await User.find()
      .select({
        _id: 1,
        first_name: 1,
        last_name: 1,
        occupation: 1,
      })
      .exec();
    response.json(users);
  } catch (error) {
    console.error("Error fetching user list:", error.stack || error);
    response
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

router.get("/:id", async (request, response) => {
  try {
    const userId = request.params.id;
    console.log("Fetching user with ID:", userId);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log("Invalid user ID");
      return response.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(userId)
      .select({
        _id: 1,
        first_name: 1,
        last_name: 1,
        location: 1,
        description: 1,
        occupation: 1,
      })
      .exec();

    if (!user) {
      console.log("User not found");
      return response.status(404).json({ message: "User not found" });
    }

    console.log("User found:", user);
    response.json(user);
  } catch (error) {
    console.error("Error fetching user:", error.stack || error);
    response
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});


router.post("/login", async (req, res) => {
  const {login_name} = req.body;
  console.log(req.body)
  try {
     const user = await User.findOne({ login_name });
  if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    // res.status(200).json({ 
    //   message: "Login successful" 
    // });
      req.session.user_id = user._id;
      console.log(req.session.user_id)
      res.status(200).json({
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      login_name: user.login_name
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// router.post("/admin/logout",async(req,res)=>{
//   // if(!req.session.user_id){
//   //   return res.status(400).send({ message: "Not logged in" });
//   // }
//   req.session.destroy((err)=>{
//     if(err){
//       return res.status(500).send({ message: "Logout failed" });
//     }
//     res.status(200).send({ message: "Logout successful" });
//   })
// })


module.exports = router;

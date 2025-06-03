const express = require("express");
const app = express();
const cors = require("cors");
const dbConnect = require("./db/dbConnect");
const UserRouter = require("./routes/UserRouter");
const PhotoRouter = require("./routes/PhotoRouter");
const CommentRouter = require("./routes/CommentRouter");
const session = require("express-session");


dbConnect();
app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true               
}));
app.use(express.json());

app.use(session({
  secret: "photo_app_secret",
  resave: false,
  saveUninitialized: false
}));
app.use("/api/user", UserRouter);
app.use("/api/photo", PhotoRouter);
app.use("/api/comment", CommentRouter);
app.get("/", (request, response) => {
  response.send({ message: "Hello from photo-sharing app API!" });
});


app.listen(8081, () => {
  console.log("server listening on port 8081");
});

import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, default: "", maxlength: 3000 },
    media: [
      {
        url: String,
        type: { type: String, enum: ["image", "video"] },
      },
    ],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);

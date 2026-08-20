import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    mediaUrl: { type: String, default: "" },
    mediaType: { type: String, enum: ["image", "video", "text"], default: "image" },
    text: { type: String, default: "" },
    backgroundColor: { type: String, default: "#1877f2" },
    viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// TTL index - MongoDB automatically deletes documents after expiresAt
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Story", storySchema);

"use client";
import { useState } from "react";
import { Heart, MessageSquare, Send, Loader2 } from "lucide-react";

interface Comment {
  name: string;
  comment: string;
  createdAt: string;
}

interface EngagementSectionProps {
  slug: string;
  initialLikes: number;
  initialComments: Comment[];
}

export default function EngagementSection({
  slug,
  initialLikes,
  initialComments,
}: EngagementSectionProps) {
  const [likes, setLikes] = useState(initialLikes || 0);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>(initialComments || []);
  
  const [name, setName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [liking, setLiking] = useState(false);

  const handleLike = async () => {
    if (liked || liking) return;
    setLiking(true);
    try {
      const res = await fetch("/api/blogs/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const json = await res.json();
      if (json.success) {
        setLikes(json.likes);
        setLiked(true);
      }
    } catch (err) {
      console.error("Error liking post:", err);
    } finally {
      setLiking(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !commentText.trim() || submittingComment) return;
    setSubmittingComment(true);
    try {
      const res = await fetch("/api/blogs/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, name: name.trim(), comment: commentText.trim() }),
      });
      const json = await res.json();
      if (json.success && json.comments) {
        setComments(json.comments);
        setCommentText("");
      }
    } catch (err) {
      console.error("Error submitting comment:", err);
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <div className="mt-16 pt-8 border-t border-white/8 space-y-12">
      {/* ── LIKES SECTION ── */}
      <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-2xl p-6">
        <div>
          <h4 className="text-base font-bold text-white mb-1">Found this analysis helpful?</h4>
          <p className="text-xs text-slate-500">Show your support to help other retail investors find this post.</p>
        </div>
        <button
          onClick={handleLike}
          disabled={liked || liking}
          className={`flex items-center gap-2 px-5 py-3 rounded-full font-bold text-sm transition-all duration-300 ${
            liked
              ? "bg-rose-500/20 border border-rose-500/30 text-rose-400"
              : "bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white hover:scale-105 active:scale-95"
          }`}
        >
          {liking ? (
            <Loader2 size={16} className="animate-spin text-rose-400" />
          ) : (
            <Heart size={16} className={liked ? "fill-rose-400 text-rose-400" : ""} />
          )}
          <span>{likes} {likes === 1 ? "Like" : "Likes"}</span>
        </button>
      </div>

      {/* ── COMMENTS SECTION ── */}
      <div className="space-y-6">
        <h3 className="text-xl font-black text-white flex items-center gap-2 border-b border-white/5 pb-3">
          <MessageSquare size={20} className="text-cyan-400" /> Market Discussion ({comments.length})
        </h3>

        {/* Comment Form */}
        <form onSubmit={handleCommentSubmit} className="space-y-4 bg-white/[0.015] border border-white/5 rounded-2xl p-6">
          <h4 className="text-xs text-slate-400 font-bold uppercase tracking-wider">Leave a Comment</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                required
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-500 outline-none transition"
              />
            </div>
          </div>
          <div>
            <textarea
              required
              rows={4}
              placeholder="Share your thoughts on this stock, analysis, or market update..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-cyan-500 outline-none transition resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={submittingComment || !name.trim() || !commentText.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-xs rounded-xl transition uppercase tracking-wider"
          >
            {submittingComment ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Sending...
              </>
            ) : (
              <>
                <Send size={14} /> Post Comment
              </>
            )}
          </button>
        </form>

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-6 text-center">No comments yet. Start the discussion!</p>
          ) : (
            comments.map((c, idx) => (
              <div key={idx} className="bg-white/[0.01] border border-white/5 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-bold text-xs text-slate-300">{c.name}</span>
                  <span className="text-[10px] text-slate-600">
                    {new Date(c.createdAt).toLocaleDateString()} at {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed whitespace-pre-line">{c.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

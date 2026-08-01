import React, { useState } from "react";
import { useNavigate } from "react-router";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { useAuth } from "@/src/hooks/useAuth";

const CATEGORIES = ["Technology", "Politics", "Business", "Health", "Entertainment"];

export function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [tagsInput, setTagsInput] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="text-center py-32 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
        <h2 className="text-2xl font-bold mb-4 text-neutral-900 dark:text-neutral-100">Access Denied</h2>
        <p className="text-neutral-600 dark:text-neutral-400">Please sign in to publish articles.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !excerpt) return;
    setLoading(true);

    try {
      const tags = tagsInput.split(",").map(t => t.trim()).filter(Boolean);
      await addDoc(collection(db, "articles"), {
        title,
        content,
        excerpt,
        category,
        tags,
        imageUrl,
        authorId: user.uid,
        authorName: user.displayName || user.email?.split("@")[0] || "Anonymous",
        createdAt: serverTimestamp(),
      });
      navigate("/");
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Failed to publish article.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Publish New Article</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">Create and share a new story with the world.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-neutral-900 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300">Title</label>
          <input
            type="text"
            required
            className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter an engaging title"
          />
        </div>
        
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300">Excerpt</label>
          <p className="text-xs text-neutral-500 mb-2">A short, compelling summary of the article.</p>
          <textarea
            required
            rows={2}
            className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors resize-none"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300">Full Content</label>
          <textarea
            required
            rows={12}
            className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors resize-y"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your article content here..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300">Category</label>
            <select
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300">Tags</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. tech, future, ai (comma separated)"
            />
          </div>
        </div>

        <div className="space-y-1 pb-4">
          <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300">Cover Image URL</label>
          <input
            type="url"
            className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
          {imageUrl && (
            <div className="mt-4 rounded-xl overflow-hidden h-40 border border-neutral-200 dark:border-neutral-700">
               <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg transition-colors shadow-md disabled:opacity-50"
        >
          {loading ? "Publishing..." : "Publish Article"}
        </button>
      </form>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { doc, getDoc, collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { Article, Comment } from "@/src/types";
import { useAuth } from "@/src/hooks/useAuth";
import { format } from "date-fns";
import { ArrowLeft, Share2, MessageSquare, Twitter, Facebook, Linkedin, Tag } from "lucide-react";

export function ArticlePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [commenting, setCommenting] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    const fetchArticle = async () => {
      const docRef = doc(db, "articles", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setArticle({ id: docSnap.id, ...docSnap.data() } as Article);
      }
      setLoading(false);
    };
    fetchArticle();

    const q = query(collection(db, "comments"), where("articleId", "==", id), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const comms: Comment[] = [];
      snapshot.forEach(doc => {
        comms.push({ id: doc.id, ...doc.data() } as Comment);
      });
      setComments(comms);
    });

    return unsubscribe;
  }, [id]);

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = article?.title || "Article";
    let shareUrl = "";
    
    if (platform === "twitter") shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
    if (platform === "facebook") shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    if (platform === "linkedin") shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
    
    if (shareUrl) window.open(shareUrl, "_blank", "width=600,height=400");
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user || !id) return;
    
    setCommenting(true);
    try {
      await addDoc(collection(db, "comments"), {
        articleId: id,
        userId: user.uid,
        userName: user.displayName || user.email?.split("@")[0] || "Anonymous",
        content: newComment.trim(),
        createdAt: serverTimestamp()
      });
      setNewComment("");
    } catch (error) {
      console.error("Error posting comment", error);
    } finally {
      setCommenting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-20">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-neutral-200 dark:bg-neutral-800 w-24 rounded-full mx-auto"></div>
          <div className="h-16 bg-neutral-200 dark:bg-neutral-800 w-3/4 mx-auto rounded-xl"></div>
          <div className="h-96 bg-neutral-200 dark:bg-neutral-800 rounded-2xl w-full"></div>
          <div className="space-y-4">
            <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-full"></div>
            <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-full"></div>
            <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-32 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-neutral-900 dark:text-neutral-100">Article not found</h2>
        <Link to="/" className="text-indigo-600 hover:underline">Return to Home</Link>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 mb-10 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>
      
      <header className="mb-12 text-center">
        <div className="mb-6">
          <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 text-sm font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
            {article.category}
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-8 leading-tight tracking-tight text-neutral-900 dark:text-neutral-50">{article.title}</h1>
        <div className="flex items-center justify-center gap-4 text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center font-bold text-neutral-700 dark:text-neutral-300">
               {article.authorName.charAt(0).toUpperCase()}
             </div>
             <div className="text-left flex flex-col">
                <span className="font-semibold text-neutral-900 dark:text-neutral-200 leading-tight">{article.authorName}</span>
                <span className="text-sm">{article.createdAt?.toDate ? format(article.createdAt.toDate(), 'MMMM d, yyyy') : ''}</span>
             </div>
          </div>
        </div>
      </header>

      {article.imageUrl && (
        <div className="mb-12 rounded-3xl overflow-hidden shadow-xl shadow-neutral-200/50 dark:shadow-none border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900">
          <img src={article.imageUrl} alt={article.title} className="w-full h-auto object-cover max-h-[500px]" />
        </div>
      )}

      <div className="prose prose-lg md:prose-xl dark:prose-invert max-w-none mb-16 prose-indigo font-serif leading-relaxed text-neutral-800 dark:text-neutral-300">
        {article.content.split('\n').map((paragraph, idx) => (
          paragraph.trim() ? <p key={idx} className="mb-6">{paragraph}</p> : null
        ))}
      </div>

      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-12 py-6 border-y border-neutral-200 dark:border-neutral-800">
          <Tag className="w-5 h-5 text-neutral-400" />
          {article.tags.map(tag => (
            <span key={tag} className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-full text-sm font-medium">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Share Section */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 flex flex-col sm:flex-row items-center justify-between mb-16 shadow-sm">
        <div className="font-bold text-lg flex items-center gap-2 mb-4 sm:mb-0 text-neutral-900 dark:text-neutral-100">
          <Share2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Share this article
        </div>
        <div className="flex gap-3">
          <button onClick={() => handleShare('twitter')} className="flex items-center gap-2 px-4 py-2 bg-[#1DA1F2]/10 text-[#1DA1F2] hover:bg-[#1DA1F2]/20 font-medium rounded-xl transition-colors"><Twitter className="w-5 h-5" /> <span className="hidden sm:inline">Twitter</span></button>
          <button onClick={() => handleShare('facebook')} className="flex items-center gap-2 px-4 py-2 bg-[#4267B2]/10 text-[#4267B2] hover:bg-[#4267B2]/20 font-medium rounded-xl transition-colors"><Facebook className="w-5 h-5" /> <span className="hidden sm:inline">Facebook</span></button>
          <button onClick={() => handleShare('linkedin')} className="flex items-center gap-2 px-4 py-2 bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2]/20 font-medium rounded-xl transition-colors"><Linkedin className="w-5 h-5" /> <span className="hidden sm:inline">LinkedIn</span></button>
        </div>
      </div>

      {/* Comments Section */}
      <section className="bg-neutral-50 dark:bg-neutral-900/50 p-6 sm:p-10 rounded-3xl border border-neutral-200 dark:border-neutral-800">
        <h3 className="text-2xl font-bold mb-8 flex items-center gap-3 text-neutral-900 dark:text-neutral-100">
          <MessageSquare className="w-6 h-6 text-indigo-500" />
          Discussions <span className="text-neutral-400 font-normal">({comments.length})</span>
        </h3>

        {user ? (
          <form onSubmit={handlePostComment} className="mb-12">
            <div className="relative bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-shadow">
              <textarea
                rows={4}
                className="w-full px-5 py-4 bg-transparent outline-none resize-none text-neutral-900 dark:text-neutral-100 placeholder-neutral-500"
                placeholder="Share your perspective..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                required
              />
              <div className="bg-neutral-50 dark:bg-neutral-950 px-4 py-3 flex justify-end border-t border-neutral-200 dark:border-neutral-800">
                 <button
                  type="submit"
                  disabled={commenting || !newComment.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm disabled:opacity-50"
                 >
                   {commenting ? "Posting..." : "Post Comment"}
                 </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="bg-white dark:bg-neutral-900 p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-center mb-12 shadow-sm">
            <MessageSquare className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-4" />
            <h4 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-2">Join the Conversation</h4>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">Sign in to share your thoughts and interact with other readers.</p>
            {/* Using window to trigger login from header or we could pass login down */}
          </div>
        )}

        <div className="space-y-8">
          {comments.map(comment => (
            <div key={comment.id} className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-inner">
                {comment.userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 bg-white dark:bg-neutral-900 p-5 rounded-2xl rounded-tl-none border border-neutral-200 dark:border-neutral-800 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-neutral-900 dark:text-neutral-100">{comment.userName}</span>
                  <span className="text-xs font-medium text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-md">
                    {comment.createdAt?.toDate ? format(comment.createdAt.toDate(), 'MMM d, yyyy h:mm a') : 'Just now'}
                  </span>
                </div>
                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <div className="text-center text-neutral-500 dark:text-neutral-400 py-12 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 border-dashed">
              No comments yet. Be the first to share your thoughts!
            </div>
          )}
        </div>
      </section>
    </article>
  );
}

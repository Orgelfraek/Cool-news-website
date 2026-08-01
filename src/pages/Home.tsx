import { useState, useEffect } from "react";
import { Link } from "react-router";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { Article } from "@/src/types";
import { Search, Tag } from "lucide-react";
import { format } from "date-fns";

const CATEGORIES = ["All", "Technology", "Politics", "Business", "Health", "Entertainment"];

export function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const q = query(collection(db, "articles"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const arts: Article[] = [];
      snapshot.forEach((doc) => {
        arts.push({ id: doc.id, ...doc.data() } as Article);
      });
      setArticles(arts);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const filteredArticles = articles.filter((article) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = article.title.toLowerCase().includes(searchLower) || 
                          article.content.toLowerCase().includes(searchLower) ||
                          (article.tags && article.tags.some(tag => tag.toLowerCase().includes(searchLower)));
    const matchesCategory = selectedCategory === "All" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-neutral-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-full leading-5 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm transition-colors shadow-sm"
            placeholder="Search articles or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar scroll-smooth">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category 
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm" 
                  : "bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-neutral-200 dark:bg-neutral-800 h-96 rounded-2xl"></div>
          ))}
        </div>
      ) : filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map(article => (
            <Link key={article.id} to={`/article/${article.id}`} className="group flex flex-col block bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 hover:-translate-y-1">
              <div className="h-56 bg-neutral-100 dark:bg-neutral-800 overflow-hidden relative">
                {article.imageUrl ? (
                  <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-400">No Image</div>
                )}
                <div className="absolute top-4 left-4 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-indigo-600 dark:text-indigo-400 shadow-sm">
                  {article.category}
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold mb-3 text-neutral-900 dark:text-neutral-100 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">{article.title}</h3>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-6 line-clamp-3 flex-grow leading-relaxed">{article.excerpt}</p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="text-xs text-neutral-500 flex flex-col">
                    <span className="font-medium text-neutral-700 dark:text-neutral-300 mb-0.5">{article.authorName}</span>
                    <span>{article.createdAt?.toDate ? format(article.createdAt.toDate(), 'MMM d, yyyy') : ''}</span>
                  </div>
                  {article.tags && article.tags.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-md">
                      <Tag className="w-3 h-3" />
                      <span>{article.tags[0]}</span>
                      {article.tags.length > 1 && <span>+{article.tags.length - 1}</span>}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <p className="text-lg text-neutral-600 dark:text-neutral-400">No articles found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}

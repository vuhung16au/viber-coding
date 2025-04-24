'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ref, get } from 'firebase/database';
import { db } from '@/app/firebase/config';

export default function BlogPage() {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const params = useParams();
  const { lang } = params || {};

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const blogRef = ref(db, 'blog');
        const snapshot = await get(blogRef);
        
        if (snapshot.exists()) {
          const blogData = snapshot.val();
          // Convert to array and sort by date (newest first)
          const blogPostsList = Object.keys(blogData)
            .map(key => ({
              id: key,
              ...blogData[key]
            }))
            .sort((a, b) => {
              const dateA = a.publishedDate ? new Date(a.publishedDate) : new Date(0);
              const dateB = b.publishedDate ? new Date(b.publishedDate) : new Date(0);
              return dateB - dateA;
            });
          
          setBlogPosts(blogPostsList);
        } else {
          setBlogPosts([]);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError('Failed to load blog posts. Please try again later.');
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-center p-4 bg-red-100 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString(lang || 'en-US', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Blog</h1>
      
      {blogPosts.length === 0 ? (
        <div className="text-center p-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h2 className="text-xl font-bold mb-2">No Blog Posts Yet</h2>
          <p>We're working on creating interesting content. Check back soon!</p>
        </div>
      ) : (
        <div className="space-y-8">
          {blogPosts.map(post => (
            <article key={post.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              {post.image && (
                <div className="w-full h-64 relative">
                  <img 
                    src={post.image} 
                    alt={post.title || 'Blog post'} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {formatDate(post.publishedDate)}
                  {post.author && ` • By ${post.author}`}
                </p>
                {post.summary && (
                  <p className="mb-4">{post.summary}</p>
                )}
                {post.content && (
                  <div className="prose dark:prose-invert max-w-none" 
                       dangerouslySetInnerHTML={{ __html: post.content }} />
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
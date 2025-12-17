
import React, { useState } from 'react';

interface Article {
  id: number;
  category: string;
  date: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  featured?: boolean;
}

const articlesData: Article[] = [
  {
    id: 1,
    category: 'News',
    date: 'Sep 8, 2023',
    title: '10 Ideas from Inktober 2023 for your perfect tattoo',
    excerpt: 'Lorem ipsum dolor sit amet conse ctetur adis iscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    imageUrl: 'https://picsum.photos/1200/800?random=4',
    featured: true,
  },
  {
    id: 2,
    category: 'Resources',
    date: 'Sep 10, 2023',
    title: 'What are the least painful places for your first tattoo?',
    excerpt: 'Lorem ipsum dolor sit amet conse ctetur adis iscing elit sed do. Magna nisl egestas amet nietus luctus iaculis.',
    imageUrl: 'https://picsum.photos/800/600?random=5',
  }
];

const featuredArticle = articlesData.find(a => a.featured);
const otherArticles = articlesData.filter(a => !a.featured);


const LatestArticles: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const filters = ['All', 'Articles', 'Resources', 'News'];

  return (
    <section className="bg-brand-dark py-20">
      <div className="container mx-auto px-4">
        {featuredArticle && (
             <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
                 <div>
                    <img src={featuredArticle.imageUrl} alt={featuredArticle.title} className="rounded-lg w-full h-full object-cover"/>
                 </div>
                 <div className="bg-brand-gray p-10 rounded-lg -ml-0 md:-ml-24 relative">
                    <div className="flex items-center gap-4 mb-4">
                        <span className="bg-brand-red text-white text-sm font-bold px-3 py-1 rounded">{featuredArticle.category}</span>
                        <span className="text-gray-400">{featuredArticle.date}</span>
                    </div>
                    <h3 className="font-display text-4xl md:text-5xl mb-4 leading-tight">{featuredArticle.title}</h3>
                    <p className="text-gray-400 mb-6">{featuredArticle.excerpt}</p>
                    <a href="#" className="text-brand-red font-bold hover:underline">Read more</a>
                 </div>
             </div>
        )}
       
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <h2 className="font-display text-5xl md:text-6xl mb-6 md:mb-0">LATEST ARTICLES</h2>
            <div className="flex space-x-2 border border-gray-700 rounded-md p-1">
                {filters.map(filter => (
                    <button 
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-6 py-2 rounded-md text-sm font-bold transition-colors ${activeFilter === filter ? 'bg-brand-red text-white' : 'text-gray-400 hover:bg-gray-800'}`}
                    >
                        {filter}
                    </button>
                ))}
            </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-1 gap-8">
            {otherArticles.map(article => (
                <div key={article.id} className="grid md:grid-cols-2 gap-8 items-center bg-brand-gray p-8 rounded-lg">
                    <img src={article.imageUrl} alt={article.title} className="rounded-lg w-full h-full object-cover"/>
                    <div>
                        <div className="flex items-center gap-4 mb-4">
                            <span className="bg-brand-red text-white text-sm font-bold px-3 py-1 rounded">{article.category}</span>
                            <span className="text-gray-400">{article.date}</span>
                        </div>
                        <h3 className="font-display text-4xl mb-4 leading-tight">{article.title}</h3>
                        <p className="text-gray-400 mb-6">{article.excerpt}</p>
                        <a href="#" className="text-brand-red font-bold hover:underline">Read more</a>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default LatestArticles;

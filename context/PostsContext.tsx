import React, { createContext, useState, useContext, ReactNode } from 'react';
import type { Post } from '../types';

interface PostsContextType {
  posts: Post[];
  addPost: (post: Omit<Post, 'id' | 'status' | 'scheduledAt'>) => void;
  updatePost: (id: string, updates: Partial<Post>) => void;
  deletePost: (id: string) => void;
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);

const now = new Date();

export const PostsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 'dummy-1',
      content: 'Este es un borrador de ejemplo. ¡Puedes programarlo, editarlo o eliminarlo!',
      image: null,
      status: 'draft',
      scheduledAt: null,
      taskStatus: 'todo',
    },
    {
      id: 'dummy-2',
      content: 'Este es un post programado para mañana. Kolink se encargará de publicarlo por ti.',
      image: 'https://images.unsplash.com/photo-1611162617213-6d22e709c6d6?q=80&w=1974&auto=format&fit=crop',
      status: 'scheduled',
      scheduledAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      views: undefined,
      likes: undefined,
      comments: undefined,
      taskStatus: 'inprogress',
    },
    {
      id: 'dummy-3',
      content: '¡Gran noticia! Hemos lanzado nuestra nueva integración con la API de Gemini. Ahora puedes crear contenido aún más potente directamente desde tus herramientas. #AI #Developer #API',
      image: null,
      status: 'scheduled',
      scheduledAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // Published 2 days ago
      views: 8451,
      likes: 512,
      comments: 45,
      taskStatus: 'completed',
    },
    {
      id: 'dummy-4',
      content: 'Aquí van 3 consejos para mejorar tu engagement en LinkedIn:\n1. Haz preguntas abiertas.\n2. Publica de forma consistente.\n3. Interactúa con los comentarios.\n¿Cuál es tu mejor truco? #LinkedInTips #MarketingDigital',
      image: null,
      status: 'scheduled',
      scheduledAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // Published 5 days ago
      views: 12345,
      likes: 987,
      comments: 102,
      taskStatus: 'completed',
    },
     {
      id: 'dummy-5',
      content: 'Reflexionando sobre el futuro del trabajo remoto. ¿Estamos realmente preparados para un modelo híbrido a largo plazo? Me encantaría conocer vuestra opinión. #FutureOfWork #RemoteWork',
      image: 'https://images.unsplash.com/photo-1589998059171-988d887df646?q=80&w=2070&auto=format&fit=crop',
      status: 'scheduled',
      scheduledAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // Published 10 days ago
      views: 7500,
      likes: 450,
      comments: 68,
      taskStatus: 'completed',
    },
     {
      id: 'dummy-6',
      content: 'Acabo de leer un libro fascinante sobre la psicología de la persuasión. La clave no está en lo que dices, sino en cómo lo dices. Un pequeño cambio en el enfoque puede duplicar los resultados. #Libros #Business',
      image: null,
      status: 'scheduled',
      scheduledAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000), // Published 25 days ago
      views: 15200,
      likes: 1100,
      comments: 150,
      taskStatus: 'completed',
    },
    {
      id: 'dummy-7',
      content: 'Nuestro equipo ha crecido un 50% este último trimestre. ¡Increíblemente orgulloso de lo que estamos construyendo juntos en Kolink! #Startup #Growth #Team',
      image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1784&auto=format&fit=crop',
      status: 'scheduled',
      scheduledAt: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000), // Published 40 days ago
      views: 25000,
      likes: 2300,
      comments: 320,
      taskStatus: 'completed',
    }
  ]);

  const addPost = (postData: Omit<Post, 'id' | 'status' | 'scheduledAt'>) => {
    const newPost: Post = {
      ...postData,
      id: new Date().toISOString() + Math.random(),
      status: 'draft',
      scheduledAt: null,
      taskStatus: 'todo',
    };
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  const updatePost = (id: string, updates: Partial<Post>) => {
    setPosts(prevPosts =>
      prevPosts.map(post => (post.id === id ? { ...post, ...updates } : post))
    );
  };

  const deletePost = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este post?')) {
        setPosts(prevPosts => prevPosts.filter(post => post.id !== id));
    }
  };

  return (
    <PostsContext.Provider value={{ posts, addPost, updatePost, deletePost }}>
      {children}
    </PostsContext.Provider>
  );
};

export const usePosts = () => {
  const context = useContext(PostsContext);
  if (!context) {
    throw new Error('usePosts must be used within a PostsProvider');
  }
  return context;
};
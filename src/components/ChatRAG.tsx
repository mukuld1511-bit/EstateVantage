import React, { useState, useRef, useEffect } from 'react';
import { Property } from '../types';
import { PropertyCard } from './PropertyCard';
import { Send, Bot, User, Sparkles } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  properties?: Property[];
}

interface ChatRAGProps {
  onViewDetail: (property: Property) => void;
  onToggleFavorite: (propertyId: number) => void;
  favorites: number[];
}

export const ChatRAG: React.FC<ChatRAGProps> = ({
  onViewDetail,
  onToggleFavorite,
  favorites
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I am the Realtor RAG engine. What kind of property are you looking for today? (e.g. 'Find me a 3 bedroom house downtown under 1M with a pool')"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    
    // Add user message to UI immediately
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userText
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userText })
      });
      
      const data = await res.json();
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || "I couldn't process that properly.",
        properties: data.properties || []
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I encountered an error connecting to the server."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[600px] bg-white border border-outline-variant rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3 shadow-sm z-10">
        <img 
          src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=150&auto=format&fit=crop" 
          alt="AI Agent" 
          className="w-10 h-10 rounded-full object-cover shadow-sm border border-slate-200"
        />
        <div>
          <h2 className="text-xl font-sans font-bold text-slate-900">True RAG Chat Assistant</h2>
          <p className="text-xs font-mono text-slate-500">Powered by Gemini + Local SQL Retrieval</p>
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex flex-col max-w-[90%] sm:max-w-[85%] ${msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
          >
            <div className={`flex items-end gap-2 mb-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`shrink-0 w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shadow-sm border ${
                msg.role === 'user' ? 'border-blue-200' : 'border-slate-200'
              }`}>
                {msg.role === 'user' ? (
                  <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop" alt="User" className="w-full h-full object-cover" />
                ) : (
                  <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=100&auto=format&fit=crop" alt="Bot" className="w-full h-full object-cover" />
                )}
              </div>
              <div className={`px-4 py-3 rounded-2xl text-sm font-mono ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white font-medium rounded-br-sm shadow-sm' 
                  : 'bg-slate-100 text-slate-800 border border-slate-200 rounded-bl-sm shadow-sm'
              }`}>
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>

            {/* Render Property Cards if available */}
            {msg.properties && msg.properties.length > 0 && (
              <div className={`grid gap-4 mt-2 ml-10 w-full ${
                msg.properties.length === 1 ? 'grid-cols-1' : 
                msg.properties.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 
                'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              }`}>
                {msg.properties.map(prop => (
                  <PropertyCard
                    key={prop.id}
                    property={prop}
                    onViewDetail={onViewDetail}
                    onToggleFavorite={onToggleFavorite}
                    isFavorite={favorites.includes(prop.id)}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex flex-col mr-auto items-start max-w-[85%]">
            <div className="flex items-end gap-2 mb-2">
              <div className="shrink-0 w-8 h-8 rounded-full overflow-hidden shadow-sm border border-slate-200">
                <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=100&auto=format&fit=crop" alt="Bot" className="w-full h-full object-cover" />
              </div>
              <div className="px-5 py-4 bg-slate-100 border border-slate-200 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1.5">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="E.g., Query the database for a house with 3 beds..."
            className="w-full px-5 py-4 pr-14 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg transition-all cursor-pointer shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// Sample event data for static implementation
const sampleEvents = [
  {
    id: '1',
    title: 'Summer Music Festival',
    description: 'Annual music festival featuring local and international artists',
    location: { lat: 35.7219, lng: 51.3347 },
    date: '2025-07-15',
    category: 'Music'
  },
  {
    id: '2',
    title: 'Tech Conference 2025',
    description: 'The biggest tech conference of the year',
    location: { lat: 35.7246, lng: 51.3853 },
    date: '2025-08-10',
    category: 'Technology'
  },
  {
    id: '3',
    title: 'Food & Wine Festival',
    description: 'Taste the best local cuisine and wines',
    location: { lat: 35.7007, lng: 51.3947 },
    date: '2025-09-05',
    category: 'Food'
  },
  {
    id: '4',
    title: 'Art Exhibition',
    description: 'Featuring works from contemporary local artists',
    location: { lat: 35.7137, lng: 51.3898 },
    date: '2025-07-25',
    category: 'Art'
  },
  {
    id: '5',
    title: 'Charity Marathon',
    description: 'Annual charity run to support local causes',
    location: { lat: 35.7437, lng: 51.3587 },
    date: '2025-08-30',
    category: 'Sports'
  },
];

// Sample messages for demonstration
const sampleMessages = [
  { id: 1, eventId: '1', userName: 'Sarah', message: 'Is anyone going to this event?', timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: 2, eventId: '1', userName: 'Mike', message: 'Yes! Looking forward to it!', timestamp: new Date(Date.now() - 3000000).toISOString() },
  { id: 3, eventId: '1', userName: 'Emma', message: 'Does anyone know if there will be food vendors?', timestamp: new Date(Date.now() - 2400000).toISOString() },
  { id: 4, eventId: '1', userName: 'John', message: 'I saw on their website that theyll have 10 different food trucks.', timestamp: new Date(Date.now() - 1800000).toISOString() },
  { id: 5, eventId: '1', userName: 'Lisa', message: 'Awesome! Cant wait!', timestamp: new Date(Date.now() - 900000).toISOString() },
  { id: 6, eventId: '2', userName: 'David', message: 'Any recommendations for hotels nearby?', timestamp: new Date(Date.now() - 7200000).toISOString() },
  { id: 7, eventId: '3', userName: 'Rachel', message: 'Will there be vegetarian options?', timestamp: new Date(Date.now() - 5400000).toISOString() },
];

interface ChatMessage {
  id: number;
  eventId: string;
  userName: string;
  message: string;
  timestamp: string;
}

interface EventChatComponentProps {
  eventId: string;
}

const EventChatComponent = ({ eventId }: EventChatComponentProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userName, setUserName] = useState('Guest User');
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  // Fetch event details and messages (simulated)
  useEffect(() => {
    if (!eventId) return;
    
    // Simulate loading event details
    const currentEvent = sampleEvents.find(e => e.id === eventId);
    setEvent(currentEvent);
    
    // Simulate loading messages
    const eventMessages = sampleMessages.filter(msg => msg.eventId === eventId);
    setMessages(eventMessages);
    setLoading(false);
    
  }, [eventId]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    // Create new message
    const newChatMessage: ChatMessage = {
      id: Date.now(),
      eventId: eventId,
      userName: userName,
      message: newMessage.trim(),
      timestamp: new Date().toISOString()
    };
    
    // Add to messages (in a real app, you'd send to your backend)
    setMessages([...messages, newChatMessage]);
    setNewMessage('');
  };
  
  // Format timestamp
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-brand-500"></div>
      </div>
    );
  }
  
  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Event not found</h1>
        <Link 
          href="/" 
          className="text-brand-500 hover:text-brand-600"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center">
        <Link 
          href="/app/(admin)/user-dashboard" 
          className="mr-4 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{event.title}</h1>
          <p className="text-gray-500 dark:text-gray-400">Event Chat</p>
        </div>
      </div>
      
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Chat messages container */}
        <div className="h-[500px] overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">
                Be the first to start a conversation!
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="mb-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {msg.userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="ml-2">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-800 dark:text-white">
                        {msg.userName}
                      </span>
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                    <p className="mt-1 text-gray-700 dark:text-gray-300">
                      {msg.message}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Message input */}
        <div className="border-t border-gray-200 p-4 dark:border-gray-800">
          <form onSubmit={handleSubmit} className="flex items-center">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-grow rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
            />
            <button
              type="submit"
              className="ml-2 rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600 focus:outline-none"
            >
              Send
            </button>
          </form>
        </div>
      </div>
      
      {/* Event details card */}
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Event Details</h2>
        <p className="mt-2 text-gray-700 dark:text-gray-300">{event.description}</p>
        <div className="mt-2 flex items-center">
          <span className="inline-block rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800 dark:bg-gray-800 dark:text-gray-200">
            {event.category}
          </span>
          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
            {new Date(event.date).toLocaleDateString()}
          </span>
        </div>
        <div className="mt-4">
          <Link
            href={`/events/${event.id}`}
            className="text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300"
          >
            View Full Event Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventChatComponent;
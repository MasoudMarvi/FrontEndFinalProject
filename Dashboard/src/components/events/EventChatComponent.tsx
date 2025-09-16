"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getEventById } from '@/lib/api/events';
import { getChatMessagesByEvent, createChatMessage } from '@/lib/api/chatMessages';
import { ChatMessageDto, EventDetailDto, CreateChatMessageCommand } from '@/lib/api/types';
import * as signalR from "@microsoft/signalr";

interface EventChatComponentProps {
  eventId: string;
}

const EventChatComponent = ({ eventId }: EventChatComponentProps) => {
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [event, setEvent] = useState<EventDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{
    userId: string;
    fullName: string;
    email: string;
  } | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
useEffect(() => {
  if (!eventId || !currentUser) return;

  const connect = new signalR.HubConnectionBuilder()
    .withUrl("https://localhost:7235/chathub") // آدرس API
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build();

  // وقتی پیام جدید رسید
  connect.on("ReceiveMessage", (message: ChatMessageDto) => {
    setMessages(prev => [...prev, message]);
  });

  connect.start()
    .then(() => {
      console.log("SignalR Connected ✅");
      // جوین به گروه ایونت
      connect.invoke("JoinEvent", eventId);
    })
    .catch(err => console.error("SignalR error: ", err));

  setConnection(connect);

  return () => {
    connect.stop();
  };
}, [eventId, currentUser]);
  
  // First, set isClient to true when component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Get user data from localStorage only on the client
  useEffect(() => {
    if (isClient) {
      try {
        const userId = localStorage.getItem('userId');
        const fullName = localStorage.getItem('fullName');
        const email = localStorage.getItem('email');
        const accessToken = localStorage.getItem('accessToken');
        
        // Debug what we're getting from localStorage
        console.log("Auth data from localStorage:", { 
          userId, 
          fullName, 
          email, 
          hasToken: !!accessToken 
        });
        
        if (userId && accessToken) {
          // We have a logged in user
          setCurrentUser({
            userId,
            fullName: fullName || email?.split('@')[0] || 'User',
            email: email || ''
          });
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        console.error('Error accessing localStorage:', err);
        setCurrentUser(null);
      }
    }
  }, [isClient]);
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  // Fetch event details and messages from the backend
  useEffect(() => {
    const fetchData = async () => {
      if (!eventId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch event details
        const eventData = await getEventById(eventId);
        setEvent(eventData);
        
        // Fetch chat messages for this event
        const messagesData = await getChatMessagesByEvent(eventId);
        setMessages(messagesData);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load event data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [eventId]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Handle form submission to send a new message
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // if (!newMessage.trim() || !eventId) return;
      if (!newMessage.trim() || !eventId || !connection || !currentUser) return;

    
    try {
      // Create message data
      // const messageData: CreateChatMessageCommand = {
      //   eventId: eventId,
      //   messageText: newMessage.trim()
      // };
      
      // // Send to backend
      // const createdMessage = await createChatMessage(messageData);
      
      // // Add to messages
      // setMessages(prevMessages => [...prevMessages, createdMessage]);
      // setNewMessage('');
       await connection.invoke(
      "SendMessage",
      eventId,
      currentUser.userId,
      newMessage.trim()
    );

    setNewMessage('');
    } catch (err: any) {
      console.error('Error sending message:', err);
      
      // Check if error is due to auth issues
      if (err.response?.status === 401) {
        alert('Your session has expired. Please log in again.');
        window.location.href = '/auth/sign-in';
      } else {
        alert('Failed to send message. Please try again.');
      }
    }
  };
  
  // Format timestamp
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Check if the message is from the current user
  const isCurrentUserMessage = (message: ChatMessageDto) => {
    return currentUser?.userId === message.userId;
  };
  
  // Get first letter for avatar
  const getAvatarInitial = (name: string | undefined | null) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };
  
  if (loading && !isClient) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-8">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-brand-500"></div>
        </div>
      </div>
    );
  }
  
  if (error || (!event && !loading)) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-8">
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
            {error || "Event not found"}
          </h1>
          <Link 
            href="/admin-dashboard" 
            className="text-brand-500 hover:text-brand-600"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto max-w-4xl">
      <div className="mb-6 flex items-center">
        <Link 
          href={`/events/${eventId}`}
          className="mr-4 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          <span className="ml-1">Back to Event</span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {event?.title || "Event Chat"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Event Chat</p>
        </div>
      </div>
      
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {/* User info banner - REMOVED "Chatting as" section */}
        {isClient ? (
          currentUser ? (
            <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-2 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center text-brand-600 dark:text-brand-400 font-medium">
                  {getAvatarInitial(currentUser.fullName)}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {/* Removed "Chatting as {currentUser.fullName}" text */}
                  Chat Room
                </span>
              </div>
            </div>
          ) : (
            <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 text-sm text-yellow-700 dark:text-yellow-500">
              You are not logged in. Please log in to send messages.
            </div>
          )
        ) : (
          <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-2 bg-gray-50 dark:bg-gray-900/50 text-sm text-gray-500">
            Loading user information...
          </div>
        )}
        
        {/* Chat messages container */}
        <div className="h-[500px] overflow-y-auto p-4">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-brand-500"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">
                Be the first to start a conversation!
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isUserMessage = isCurrentUserMessage(msg);
              return (
                <div key={msg.messageId} className={`mb-4 ${isUserMessage ? 'flex justify-end' : ''}`}>
                  <div className={`flex items-start ${isUserMessage ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center
                      ${isUserMessage 
                        ? 'bg-brand-100 text-brand-600 dark:bg-brand-900/50 dark:text-brand-400 ml-2' 
                        : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 mr-2'}`
                    }>
                      <span className="text-sm font-medium">
                        {getAvatarInitial(msg.userName)}
                      </span>
                    </div>
                    <div>
                      <div className={`flex items-center ${isUserMessage ? 'justify-end' : ''}`}>
                        <span className={`font-medium ${isUserMessage 
                          ? 'text-brand-600 dark:text-brand-400' 
                          : 'text-gray-800 dark:text-white'}`
                        }>
                          {msg.userName || 'Anonymous'}
                        </span>
                        <span className="mx-2 text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                      <div className={`mt-1 rounded-lg py-2 px-3 max-w-xs ${
                        isUserMessage 
                          ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300' 
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      }`}>
                        <p>{msg.messageText}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Message input */}
        <div className="border-t border-gray-200 p-4 dark:border-gray-800">
          {isClient && currentUser ? (
            <form onSubmit={handleSubmit} className="flex items-center">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-grow rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
              />
              <button
                type="submit"
                className="ml-2 rounded-lg bg-brand-500 px-4 py-2.5 text-white hover:bg-brand-600 focus:outline-none disabled:bg-brand-400 disabled:cursor-not-allowed"
                disabled={!newMessage.trim()}
              >
                Send
              </button>
            </form>
          ) : isClient ? (
            <div className="flex justify-center">
              <Link
                href="/auth/sign-in"
                className="inline-flex items-center rounded-lg bg-brand-500 px-4 py-2.5 text-white hover:bg-brand-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Log in to send messages
              </Link>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="px-4 py-2.5 text-gray-500">Loading...</div>
            </div>
          )}
        </div>
      </div>
      
      {/* Event details card */}
      {event && (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Event Details</h2>
          <p className="mt-2 text-gray-700 dark:text-gray-300">{event.description}</p>
          <div className="mt-2 flex items-center">
            <span className="inline-block rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800 dark:bg-gray-800 dark:text-gray-200">
              {event.categoryName}
            </span>
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
              {new Date(event.startDateTime).toLocaleDateString()}
            </span>
          </div>
          <div className="mt-4">
            <Link
              href={`/events/${event.eventId}`}
              className="text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300"
            >
              View Full Event Details
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventChatComponent;
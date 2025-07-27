'use client';
import { useState } from 'react';
import { 
  FaEnvelope, 
  FaSearch, 
  FaReply, 
  FaTrash, 
  FaCircle,
  FaCar,
  FaRegStar,
  FaStar,
  FaRegClock,
  FaPhone,
  FaMapMarkerAlt
} from 'react-icons/fa';
import { MdOutlineMarkEmailRead } from 'react-icons/md';

interface Message {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  content: string;
  date: string;
  read: boolean;
  starred: boolean;
  location?: string;
  regarding?: string;
}

const mockMessages: Message[] = [
  {
    id: 'MSG001',
    name: 'John Mwangi',
    email: 'john@example.com',
    phone: '+254712345678',
    subject: 'Inquiry about Toyota Land Cruiser availability',
    content: 'Hello, I would like to inquire about the availability of your Toyota Land Cruiser for next weekend. What are your rates for a 3-day rental?',
    date: '2023-11-10T09:30:00',
    read: false,
    starred: true,
    location: 'Nairobi',
    regarding: 'Toyota Land Cruiser'
  },
  {
    id: 'MSG002',
    name: 'Sarah Kamau',
    email: 'sarah@example.com',
    phone: '+254723456789',
    subject: 'Booking confirmation',
    content: 'I just made a booking online but haven\'t received confirmation. Can you verify if it went through? Booking ID: SWK-00123',
    date: '2023-11-09T14:15:00',
    read: true,
    starred: false,
    regarding: 'Booking #SWK-00123'
  },
  {
    id: 'MSG003',
    name: 'David Ochieng',
    email: 'david@example.com',
    phone: '+254734567890',
    subject: 'Corporate rental inquiry',
    content: 'We\'re interested in establishing a corporate account for our staff monthly rentals. What discounts do you offer for long-term contracts?',
    date: '2023-11-08T11:45:00',
    read: true,
    starred: true,
    location: 'Westlands'
  },
  {
    id: 'MSG004',
    name: 'Grace Wambui',
    email: 'grace@example.com',
    phone: '+254745678901',
    subject: 'Complaint about vehicle condition',
    content: 'The car I rented last week had several issues - AC wasn\'t working properly and there was a strange noise from the engine. I\'d like to discuss compensation.',
    date: '2023-11-05T16:20:00',
    read: false,
    starred: false,
    regarding: 'Booking #SWK-00118'
  }
];

export default function MessagesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred'>('all');

  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'unread' && !message.read) || 
      (filter === 'starred' && message.starred);
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const markAsRead = (id: string) => {
    setMessages(messages.map(msg => 
      msg.id === id ? { ...msg, read: true } : msg
    ));
  };

  const toggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMessages(messages.map(msg => 
      msg.id === id ? { ...msg, starred: !msg.starred } : msg
    ));
  };

  const deleteMessage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMessages(messages.filter(msg => msg.id !== id));
    if (selectedMessage && selectedMessage.id === id) {
      setSelectedMessage(null);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">Customer Messages</h1>
          <p className="text-earth-light">Communications from customers and inquiries</p>
        </div>
        <div className="flex gap-2">
          <button 
            className={`px-3 py-1 rounded-lg ${filter === 'all' ? 'bg-primary text-light' : 'bg-secondary text-earth'}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`px-3 py-1 rounded-lg ${filter === 'unread' ? 'bg-primary text-light' : 'bg-secondary text-earth'}`}
            onClick={() => setFilter('unread')}
          >
            Unread
          </button>
          <button 
            className={`px-3 py-1 rounded-lg ${filter === 'starred' ? 'bg-primary text-light' : 'bg-secondary text-earth'}`}
            onClick={() => setFilter('starred')}
          >
            Starred
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 gap-6 h-full">
        {/* Messages List */}
        <div className={`${selectedMessage ? 'hidden md:block md:w-2/5' : 'w-full'} bg-light rounded-xl border border-secondary-dark overflow-hidden flex flex-col`}>
          {/* Search */}
          <div className="p-4 border-b border-secondary-dark">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-earth-light w-4 h-4" />
              <input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
            {filteredMessages.length > 0 ? (
              filteredMessages.map(message => (
                <div 
                  key={message.id}
                  className={`border-b border-secondary-dark p-4 cursor-pointer hover:bg-secondary/30 ${!message.read ? 'bg-blue-50' : ''} ${selectedMessage?.id === message.id ? 'bg-primary/10' : ''}`}
                  onClick={() => {
                    setSelectedMessage(message);
                    if (!message.read) markAsRead(message.id);
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {!message.read ? (
                        <FaCircle className="text-primary w-2 h-2" />
                      ) : (
                        <span className="w-2 h-2"></span>
                      )}
                      <h3 className={`font-medium ${!message.read ? 'text-primary-dark' : 'text-earth'}`}>
                        {message.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-earth-light">
                        {formatDate(message.date)}
                      </span>
                      <button 
                        onClick={(e) => toggleStar(message.id, e)}
                        className="text-earth-light hover:text-warning"
                      >
                        {message.starred ? <FaStar className="text-warning" /> : <FaRegStar />}
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-earth mb-1 line-clamp-1">{message.subject}</p>
                  <p className="text-xs text-earth-light line-clamp-2">{message.content}</p>
                  {(message.location || message.regarding) && (
                    <div className="flex gap-2 mt-2">
                      {message.location && (
                        <span className="inline-flex items-center gap-1 text-xs text-earth bg-secondary/30 px-2 py-0.5 rounded">
                          <FaMapMarkerAlt className="w-3 h-3" />
                          {message.location}
                        </span>
                      )}
                      {message.regarding && (
                        <span className="inline-flex items-center gap-1 text-xs text-earth bg-secondary/30 px-2 py-0.5 rounded">
                          <FaCar className="w-3 h-3" />
                          {message.regarding}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <FaEnvelope className="w-12 h-12 mx-auto text-primary mb-4" />
                <h3 className="text-lg font-semibold text-primary-dark mb-2">No messages found</h3>
                <p className="text-earth">
                  {searchTerm || filter !== 'all' 
                    ? 'Try adjusting your search or filters' 
                    : 'Your inbox is empty'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Message Detail View */}
        {selectedMessage ? (
          <div className="flex-1 bg-light rounded-xl border border-secondary-dark overflow-hidden flex flex-col md:block">
            <div className="p-4 border-b border-secondary-dark flex justify-between items-center">
              <button 
                className="md:hidden p-2 text-earth hover:text-primary"
                onClick={() => setSelectedMessage(null)}
              >
                ← Back
              </button>
              <div className="flex gap-2">
                <button className="p-2 text-earth hover:text-primary">
                  <FaReply />
                </button>
                <button 
                  className="p-2 text-earth hover:text-danger"
                  onClick={(e) => deleteMessage(selectedMessage.id, e)}
                >
                  <FaTrash />
                </button>
              </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-primary-dark mb-2">{selectedMessage.subject}</h2>
                  <div className="flex items-center gap-4">
                    <p className="text-earth font-medium">{selectedMessage.name}</p>
                    <p className="text-earth-light text-sm">{selectedMessage.email}</p>
                  </div>
                </div>
                <div className="text-sm text-earth-light flex items-center gap-2">
                  <FaRegClock className="w-3 h-3" />
                  {new Date(selectedMessage.date).toLocaleString()}
                </div>
              </div>

              <div className="prose max-w-none text-earth mb-8">
                <p>{selectedMessage.content}</p>
              </div>

              <div className="mt-8 pt-6 border-t border-secondary-dark">
                <h3 className="font-medium text-primary-dark mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <FaPhone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-earth-light">Phone</p>
                      <p className="text-earth">{selectedMessage.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <FaEnvelope className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-earth-light">Email</p>
                      <p className="text-earth">{selectedMessage.email}</p>
                    </div>
                  </div>
                  {selectedMessage.location && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <FaMapMarkerAlt className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-earth-light">Location</p>
                        <p className="text-earth">{selectedMessage.location}</p>
                      </div>
                    </div>
                  )}
                  {selectedMessage.regarding && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <FaCar className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-earth-light">Regarding</p>
                        <p className="text-earth">{selectedMessage.regarding}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-secondary-dark">
              <div className="flex gap-3">
                <input
                  placeholder="Reply to this message..."
                  className="flex-1 px-4 py-2 border border-secondary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button className="bg-primary text-light px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                  Send
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center bg-light rounded-xl border border-secondary-dark">
            <div className="text-center p-8">
              <MdOutlineMarkEmailRead className="w-12 h-12 mx-auto text-primary mb-4" />
              <h3 className="text-lg font-semibold text-primary-dark mb-2">Select a message</h3>
              <p className="text-earth">Choose a message from the list to view its contents</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
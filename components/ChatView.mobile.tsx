import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { ChatConversation, ChatMessage, User, Thread } from '../types';
import { MOCK_CHAT_CONVERSATIONS, allUsers, you, MOCK_THREADS } from '../constants';
import { Button } from './ui/Button';
import AttachEmailModal from './AttachEmailModal';
import NewChatMobile from './NewChat.mobile';


const ChatListItem: React.FC<{ conversation: ChatConversation; isSelected: boolean; onSelect: (id: string) => void }> = ({ conversation, isSelected, onSelect }) => {
    const lastMessage = conversation.messages.length > 0 ? conversation.messages[conversation.messages.length - 1] : null;

    // Gracefully handle conversations with no messages
    if (!lastMessage) {
        return (
            <div onClick={() => onSelect(conversation.id)} className={`flex items-start p-3 space-x-3 cursor-pointer transition-colors duration-150 rounded-lg ${isSelected ? 'bg-accent' : 'hover:bg-accent/50'}`}>
                <div className="relative flex-shrink-0">
                    <img alt={conversation.participant.name} src={conversation.participant.avatarUrl} className="w-12 h-12 rounded-full" />
                    <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 border-2 border-background"></span>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                        <p className="font-semibold text-foreground truncate">{conversation.participant.name}</p>
                        <p className="text-xs text-muted-foreground"></p>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                        <p className="text-sm text-muted-foreground truncate pr-2">No messages yet</p>
                    </div>
                </div>
            </div>
        );
    }
    
    const time = new Date(lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const previewText = lastMessage.text;

    return (
        <div onClick={() => onSelect(conversation.id)} className={`flex items-start p-3 space-x-3 cursor-pointer transition-colors duration-150 rounded-lg ${isSelected ? 'bg-accent' : 'hover:bg-accent/50'}`}>
            <div className="relative flex-shrink-0">
                <img alt={conversation.participant.name} src={conversation.participant.avatarUrl} className="w-12 h-12 rounded-full" />
                <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 border-2 border-background"></span>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                    <p className="font-semibold text-foreground truncate">{conversation.participant.name}</p>
                    <p className="text-xs text-muted-foreground">{time}</p>
                </div>
                <div className="flex justify-between items-center mt-1">
                    <p className="text-sm text-muted-foreground truncate pr-2">{previewText}</p>
                    {conversation.unreadCount > 0 && 
                        <span className="bg-primary text-primary-foreground text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">{conversation.unreadCount}</span>
                    }
                </div>
            </div>
        </div>
    );
};

const ChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => (
    <div className={`flex animate-fadeInUp ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-lg px-4 py-2 rounded-2xl ${message.sender === 'me' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
            <p className="whitespace-pre-wrap">{message.text}</p>
        </div>
    </div>
);

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

const ChatViewMobile: React.FC = () => {
    const [conversations, setConversations] = useState<ChatConversation[]>(MOCK_CHAT_CONVERSATIONS);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [input, setInput] = useState('');
    const [isCreatingChat, setIsCreatingChat] = useState(false);
    const [isAttachEmailModalOpen, setIsAttachEmailModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const selectedConversation = useMemo(() => {
        return conversations.find(c => c.id === selectedConversationId);
    }, [selectedConversationId, conversations]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedConversation?.messages]);

    const handleSendMessage = () => {
        if (!input.trim() || !selectedConversationId) return;

        const newMessage: ChatMessage = {
            id: `cm-${Date.now()}`,
            sender: 'me',
            text: input,
            timestamp: new Date().toISOString(),
        };

        setConversations(prev =>
            prev.map(c =>
                c.id === selectedConversationId
                    ? { ...c, messages: [...c.messages, newMessage], unreadCount: 0 }
                    : c
            )
        );
        setInput('');
    };
    
    const handleSelectUser = (user: User) => {
        if (user.email === you.email) return;

        const existingConversation = conversations.find(c => c.participant.email === user.email);
        
        if (existingConversation) {
            setSelectedConversationId(existingConversation.id);
        } else {
            const newConversation: ChatConversation = {
                id: `chat-${Date.now()}`,
                participant: user,
                messages: [],
                unreadCount: 0,
            };
            setConversations(prev => [newConversation, ...prev]);
            setSelectedConversationId(newConversation.id);
        }
        setIsCreatingChat(false);
    };

    const handleCreateGroup = (users: User[]) => {
        if (users.length === 0) return;

        const groupName = users.map(u => u.name.split(' ')[0]).join(', ');
        const groupUser: User = {
            name: groupName,
            email: `group-${Date.now()}@hogwarts.uk.edu`,
            avatarUrl: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(groupName)}`,
            department: 'Group Chat'
        };

        const newConversation: ChatConversation = {
            id: `chat-${Date.now()}`,
            participant: groupUser,
            messages: [{
                id: `cm-${Date.now()}`,
                sender: 'me',
                text: `You created a group with ${groupName}.`,
                timestamp: new Date().toISOString()
            }],
            unreadCount: 0,
        };
        setConversations(prev => [newConversation, ...prev]);
        setSelectedConversationId(newConversation.id);
        setIsCreatingChat(false);
    };

    const handleAttachEmail = (thread: Thread) => {
        setInput(prev => `${prev}\n\n--- Attached Email ---\nSubject: ${thread.subject}\nFrom: ${thread.participants[0].name}\n---`.trim());
    };
    
    const handleAttachmentClick = () => {
        fileInputRef.current?.click();
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const fileName = e.target.files[0].name;
            setInput(prev => `${prev} [Attached file: ${fileName}]`);
        }
    };

    const handleBack = () => {
        setSelectedConversationId(null);
    };

    if (isCreatingChat) {
        return (
            <NewChatMobile
                onBack={() => setIsCreatingChat(false)}
                users={allUsers}
                onSelectUser={handleSelectUser}
                onCreateGroup={handleCreateGroup}
            />
        );
    }

    const showDetailView = !!selectedConversationId;

    return (
        <div className="flex h-full w-full bg-background">
            {/* Chat List Sidebar */}
            <div className={cn(
                "w-full border-r border-border flex-shrink-0 flex-col h-full",
                showDetailView ? 'hidden' : 'flex'
            )}>
                <div className="p-4 border-b border-border flex-shrink-0 flex items-center justify-between">
                    <h2 className="text-xl font-bold">Chats</h2>
                    <Button 
                        onClick={() => setIsCreatingChat(true)}
                        variant="ghost" 
                        size="icon" 
                        title="New Chat"
                    >
                        <i className="fa-solid fa-pen-to-square w-5 h-5"></i>
                    </Button>
                </div>
                <div className="relative p-3 border-b border-border flex-shrink-0">
                    <i className="fa-solid fa-magnifying-glass absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"></i>
                    <input type="text" placeholder="Search chats..." className="w-full bg-secondary border-none rounded-lg pl-10 pr-4 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                    {conversations.map(conv => (
                        <ChatListItem key={conv.id} conversation={conv} isSelected={conv.id === selectedConversationId} onSelect={setSelectedConversationId} />
                    ))}
                </div>
            </div>

            {/* Main Chat Window */}
            <div className={cn(
                "flex-col flex-1 h-full bg-card backdrop-blur-xl",
                showDetailView ? 'flex' : 'hidden'
            )}>
                {selectedConversation ? (
                    <>
                        <header className="flex-shrink-0 p-2 border-b border-border flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <Button variant="ghost" size="icon" className="h-10 w-10" onClick={handleBack}>
                                    <i className="fa-solid fa-arrow-left w-5 h-5"></i>
                                </Button>
                                <img src={selectedConversation.participant.avatarUrl} alt={selectedConversation.participant.name} className="w-10 h-10 rounded-full" />
                                <div>
                                    <p className="font-semibold text-foreground">{selectedConversation.participant.name}</p>
                                    <p className="text-xs text-muted-foreground">Online</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-1">
                                <Button variant="ghost" size="icon"><i className="fa-solid fa-phone w-5 h-5"></i></Button>
                                <Button variant="ghost" size="icon"><i className="fa-solid fa-video w-5 h-5"></i></Button>
                                <Button variant="ghost" size="icon"><i className="fa-solid fa-ellipsis-v w-5 h-5"></i></Button>
                            </div>
                        </header>
                        <main className="flex-1 overflow-y-auto px-4 pt-4 pb-[50px]">
                            <div className="space-y-4">
                                {selectedConversation.messages.map((msg) => <ChatBubble key={msg.id} message={msg} />)}
                                <div ref={chatEndRef} />
                            </div>
                        </main>
                        <footer className="p-4 border-t border-border bg-background">
                             <div className="flex items-end space-x-2 w-full bg-secondary border border-border rounded-xl p-2">
                                <textarea
                                    placeholder={`Message ${selectedConversation.participant.name}...`}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                                    rows={1}
                                    className="flex-1 bg-transparent py-1.5 text-sm text-secondary-foreground placeholder-muted-foreground focus:outline-none resize-none max-h-[200px] no-scrollbar"
                                    onInput={(e) => {
                                        const target = e.target as HTMLTextAreaElement;
                                        target.style.height = 'auto';
                                        target.style.height = `${target.scrollHeight}px`;
                                    }}
                                />
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                                <Button variant="ghost" size="icon" className="flex-shrink-0" aria-label="Attach file" onClick={handleAttachmentClick}>
                                    <i className="fa-solid fa-paperclip w-5 h-5 text-muted-foreground"></i>
                                </Button>
                                <Button variant="ghost" size="icon" className="flex-shrink-0" aria-label="Mention email" onClick={() => setIsAttachEmailModalOpen(true)}>
                                    <i className="fa-solid fa-at w-5 h-5 text-muted-foreground"></i>
                                </Button>
                                <Button onClick={handleSendMessage} disabled={!input.trim()} size="icon" className="rounded-full flex-shrink-0" aria-label="Send message">
                                    <i className="fa-solid fa-paper-plane w-5 h-5"></i>
                                </Button>
                            </div>
                        </footer>
                    </>
                ) : null}
            </div>
            <AttachEmailModal 
                isOpen={isAttachEmailModalOpen}
                onClose={() => setIsAttachEmailModalOpen(false)}
                threads={MOCK_THREADS}
                onSelect={handleAttachEmail}
            />
        </div>
    );
};

export default ChatViewMobile;

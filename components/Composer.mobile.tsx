import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/Button';
import type { Thread } from '../types';

interface ComposerMobileProps {
    onClose: () => void;
    initialState?: { to?: string; subject?: string; body?: string; } | null;
    onSend: (email: { to: string, cc: string, bcc: string, subject: string, body: string, attachments: File[] }) => void;
}

const ComposerMobile: React.FC<ComposerMobileProps> = ({ onClose, initialState, onSend }) => {
    const [to, setTo] = useState('');
    const [cc, setCc] = useState('');
    const [bcc, setBcc] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [attachments, setAttachments] = useState<File[]>([]);
    const [isConfirmCloseOpen, setIsConfirmCloseOpen] = useState(false);
    const [isCcBccExpanded, setIsCcBccExpanded] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const hasContent = to || cc || bcc || subject || body || attachments.length > 0;
    
    useEffect(() => {
        if (initialState) {
            setTo(initialState.to || '');
            setSubject(initialState.subject || '');
            setBody(initialState.body || '');
        }
    }, [initialState]);

    const handleClose = () => {
        if(hasContent) {
            setIsConfirmCloseOpen(true);
        } else {
            onClose();
        }
    };
    
    const handleSaveDraft = () => {
        console.log('Draft saved.');
        setIsConfirmCloseOpen(false);
        onClose();
    };
    
    const handleDeleteDraft = () => {
        setIsConfirmCloseOpen(false);
        onClose();
    };
    
    const handleContinueEditing = () => {
        setIsConfirmCloseOpen(false);
    };

    const handleSend = () => {
        if (!to.trim() || !subject.trim()) {
            alert("Please fill in the recipient and subject fields.");
            return;
        }
        onSend({ to, cc, bcc, subject, body, attachments });
    };
    
    const handleAttachClick = () => {
        fileInputRef.current?.click();
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="h-full w-full bg-background flex flex-col animate-fadeInUp">
            <header className="p-2 flex items-center justify-between flex-shrink-0 border-b border-border">
                <div className="flex items-center">
                    <Button variant="ghost" size="icon" onClick={handleClose} className="h-10 w-10 text-muted-foreground">
                        <i className="fa-solid fa-xmark w-5 h-5"></i>
                    </Button>
                    <h2 className="text-lg font-bold ml-2">New Message</h2>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" onClick={handleAttachClick} className="h-10 w-10 text-muted-foreground">
                        <i className="fa-solid fa-paperclip w-5 h-5"></i>
                    </Button>
                    <Button onClick={handleSend} disabled={!to.trim() && !subject.trim()} size="icon">
                        <i className="fa-solid fa-paper-plane w-5 h-5"></i>
                    </Button>
                </div>
            </header>
            <div className="flex-1 flex flex-col overflow-y-auto p-4">
                <div>
                    <div className="border-b border-border flex items-center">
                        <span className="py-2 pr-2 text-sm text-muted-foreground">To</span>
                        <input 
                            type="text" 
                            value={to} 
                            onChange={(e) => setTo(e.target.value)} 
                            placeholder="" 
                            className="w-full py-2 bg-transparent focus:outline-none text-sm text-foreground flex-1"
                        />
                        <Button variant="ghost" size="icon" onClick={() => setIsCcBccExpanded(prev => !prev)} className="h-10 w-10 text-muted-foreground">
                            <i className={`fa-solid fa-chevron-down w-4 h-4 transition-transform duration-200 ${isCcBccExpanded ? 'rotate-180' : ''}`}></i>
                        </Button>
                    </div>
                    
                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isCcBccExpanded ? 'max-h-40' : 'max-h-0'}`}>
                        <div className="border-b border-border flex items-center">
                            <span className="py-2 pr-2 text-sm text-muted-foreground">Cc</span>
                            <input 
                                type="text" 
                                value={cc} 
                                onChange={(e) => setCc(e.target.value)} 
                                placeholder="" 
                                className="w-full py-2 bg-transparent focus:outline-none text-sm text-foreground"
                            />
                        </div>
                        <div className="border-b border-border flex items-center">
                            <span className="py-2 pr-2 text-sm text-muted-foreground">Bcc</span>
                            <input 
                                type="text" 
                                value={bcc} 
                                onChange={(e) => setBcc(e.target.value)} 
                                placeholder="" 
                                className="w-full py-2 bg-transparent focus:outline-none text-sm text-foreground"
                            />
                        </div>
                    </div>
                </div>
                <div className="border-b border-border">
                    <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" className="w-full py-3 bg-transparent focus:outline-none text-sm text-foreground placeholder:text-muted-foreground"/>
                </div>
                {attachments.length > 0 && (
                    <div className="py-2 border-b border-border max-h-28 overflow-y-auto no-scrollbar">
                        {attachments.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-1.5 rounded-md my-1 bg-secondary animate-fadeIn">
                                <div className="flex items-center space-x-2 text-sm min-w-0">
                                    <i className="fa-solid fa-paperclip text-muted-foreground flex-shrink-0"></i>
                                    <span className="truncate text-secondary-foreground">{file.name}</span>
                                    <span className="text-muted-foreground text-xs flex-shrink-0">({(file.size / 1024).toFixed(1)} KB)</span>
                                </div>
                                <button onClick={() => removeAttachment(index)} className="text-muted-foreground hover:text-foreground flex-shrink-0 ml-2"><i className="fa-solid fa-xmark"></i></button>
                            </div>
                        ))}
                    </div>
                )}
                <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="w-full flex-1 pt-3 bg-transparent focus:outline-none text-base resize-none text-foreground placeholder:text-muted-foreground"
                    placeholder="Compose email"
                />
            </div>
             <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} className="hidden" />

             {isConfirmCloseOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={handleContinueEditing}>
                    <div className="bg-card w-full rounded-t-2xl p-4 animate-fadeInUp" onClick={(e) => e.stopPropagation()}>
                        <div className="w-8 h-1 bg-muted rounded-full mx-auto mb-4"></div>
                        <h3 className="text-lg font-semibold text-center text-foreground">Save or discard draft?</h3>
                        <p className="text-sm text-muted-foreground text-center mt-1">You can find saved drafts later.</p>
                        <div className="mt-6 space-y-2">
                             <Button size="lg" className="w-full" onClick={handleSaveDraft}>Save Draft</Button>
                             <Button variant="destructive" size="lg" className="w-full" onClick={handleDeleteDraft}>Delete Draft</Button>
                             <Button variant="secondary" size="lg" className="w-full mt-4" onClick={handleContinueEditing}>Continue Editing</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComposerMobile;
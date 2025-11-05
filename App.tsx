import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import AIAssistant from './components/AIAssistant';
import CopilotView from './components/CopilotView';
import CopilotViewMobile from './components/CopilotView.mobile';
import ChatView from './components/ChatView';
import ChatViewMobile from './components/ChatView.mobile';
import SettingsView from './components/SettingsView';
import { SettingsViewMobile } from './components/SettingsView.mobile';
import { MOCK_THREADS, you, youLiverpool } from './constants';
import type { Thread, Message } from './types';
import PrimarySidebar from './components/PrimarySidebar';
import DiscoverModal from './components/DiscoverModal';
import DiscoverModalMobile from './components/DiscoverModal.mobile';
import SnoozePopover from './components/SnoozePopover';
import { GoogleGenAI, Type } from '@google/genai';
import EmailView from './components/EmailView';
import Composer from './components/Composer';
import ComposerMobile from './components/Composer.mobile';
import DriveView from './components/DriveView';
import DesignSystemView from './components/DesignSystemView';
import DesignSystemViewMobile from './components/DesignSystemView.mobile';
import EmailContextMenu from './components/EmailContextMenu';
import KebabMenu from './components/KebabMenu';
import Resizer from './components/ui/Resizer';
import SearchFilterPopover from './components/SearchFilterPopover';
import MobileBottomNav from './components/MobileBottomNav';
import EmailDetailActionBar from './components/EmailDetailActionBar';
import UndoSnackbar from './components/ui/UndoSnackbar';
import UndoSnackbarMobile from './components/ui/UndoSnackbar.mobile';
import Onboarding from './components/onboarding/Onboarding';
import AIAssistantModal from './components/AIAssistantModal';
import { AppContext, Module } from './components/context/AppContext';


type Theme = 'light' | 'dark' | 'system';
type Domain = 'hogwarts' | 'liverpool';

export interface SearchFilters {
  query: string;
  sender: string;
  dateRange: 'any' | '7d' | '30d';
  status: 'any' | 'read' | 'unread';
}

const App: React.FC = () => {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(() => localStorage.getItem('onboardingComplete') === 'true');
  const [threads, setThreads] = useState<Thread[]>(MOCK_THREADS);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(window.innerWidth < 768 ? null : 'thread-1');
  const [selectedThreadIds, setSelectedThreadIds] = useState<string[]>([]);
  
  const [activeModule, setActiveModule] = useState<Module>('email');
  const [activeEmailView, setActiveEmailView] = useState('inbox');
  const [activeDomain, setActiveDomain] = useState<Domain>('hogwarts');
  const [isEmailSidebarOpen, setIsEmailSidebarOpen] = useState<boolean>(false);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerState, setComposerState] = useState<{ to: string; subject: string; body: string; } | null>(null);
  const [isComposerMinimized, setIsComposerMinimized] = useState(false);
  const [isComposerMaximized, setIsComposerMaximized] = useState(false);

  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState<boolean>(false);
  const [isDiscoverModalOpen, setIsDiscoverModalOpen] = useState(false);
  const [aiAssistantMode, setAiAssistantMode] = useState<'default' | 'scheduleMeeting'>('default');

  const [snoozeTarget, setSnoozeTarget] = useState<{ threadId: string; anchorEl: HTMLElement } | null>(null);
  const [contextMenuTarget, setContextMenuTarget] = useState<{ x: number; y: number; threadId: string } | null>(null);
  const [kebabMenuTarget, setKebabMenuTarget] = useState<{ x: number; y: number; threadId: string } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    sender: '',
    dateRange: 'any',
    status: 'any',
  });
  const [isSearchFilterOpen, setIsSearchFilterOpen] = useState(false);
  const [searchFilterAnchorEl, setSearchFilterAnchorEl] = useState<HTMLElement | null>(null);

  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('theme') as Theme) || 'system'
  );

  const [ai, setAi] = useState<GoogleGenAI | null>(null);
  const [threadSummary, setThreadSummary] = useState<{
    threadId: string | null;
    summary: string | null;
    isLoading: boolean;
    error: string | null;
  }>({ threadId: null, summary: null, isLoading: false, error: null });

  // Mobile view
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Undo Snackbar state
  const [undoState, setUndoState] = useState<{ message: string; onUndo: () => void; } | null>(null);
  const undoTimeoutRef = useRef<number | null>(null);

  // Sidebar resizing logic
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const isResizingSidebar = useRef(false);
  const startSidebarX = useRef(0);
  const startSidebarWidth = useRef(0);

  // State for new settings view
  const [initialSettingsView, setInitialSettingsView] = useState<string | null>(null);

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboardingComplete', 'true');
    setIsOnboardingComplete(true);
  };

  const handleSidebarMouseDown = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      isResizingSidebar.current = true;
      startSidebarX.current = e.clientX;
      startSidebarWidth.current = sidebarWidth;
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
  }, [sidebarWidth]);

  const handleSidebarMouseMove = useCallback((e: MouseEvent) => {
      if (!isResizingSidebar.current) return;
      const deltaX = e.clientX - startSidebarX.current;
      const newWidth = startSidebarWidth.current + deltaX;
      const minWidth = 220;
      const maxWidth = 400;
      setSidebarWidth(Math.max(minWidth, Math.min(newWidth, maxWidth)));
  }, []);

  const handleSidebarMouseUp = useCallback(() => {
      isResizingSidebar.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
      window.addEventListener('mousemove', handleSidebarMouseMove);
      window.addEventListener('mouseup', handleSidebarMouseUp);
      return () => {
          window.removeEventListener('mousemove', handleSidebarMouseMove);
          window.removeEventListener('mouseup', handleSidebarMouseUp);
      };
  }, [handleSidebarMouseMove, handleSidebarMouseUp]);


  useEffect(() => {
    if (process.env.API_KEY) {
        try {
            const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
            setAi(genAI);
        } catch(e) {
            console.error("Failed to initialize GoogleGenAI", e);
        }
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    
    const applyTheme = () => {
        const isDark =
          theme === 'dark' ||
          (theme === 'system' &&
            window.matchMedia('(prefers-color-scheme: dark)').matches);

        root.classList.remove(isDark ? 'light' : 'dark');
        root.classList.add(isDark ? 'dark' : 'light');
    };

    applyTheme();
    localStorage.setItem('theme', theme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
        if (theme === 'system') {
            applyTheme();
        }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  useEffect(() => {
    // This timer ensures that the list of snoozed emails is re-evaluated periodically,
    // allowing emails to automatically return to the inbox when their snooze time expires.
    const timer = setInterval(() => {
        setCurrentTime(new Date());
    }, 30000); // Check every 30 seconds
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Mobile view
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const selectedThread = useMemo(() => {
    return threads.find(thread => thread.id === selectedThreadId) || null;
  }, [selectedThreadId, threads]);

  const handleToggleSelection = (threadId: string) => {
    setSelectedThreadIds(prev =>
      prev.includes(threadId)
        ? prev.filter(id => id !== threadId)
        : [...prev, threadId]
    );
  };
  
  const handleClearSelection = () => {
    setSelectedThreadIds([]);
  };

  const closeUndo = () => {
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    setUndoState(null);
  };

  // --- Single-Thread Actions ---
  const handleArchiveThread = (threadId: string) => {
    const originalThreads = [...threads];
    const updatedThreads = originalThreads.map(t => t.id === threadId ? { ...t, isArchived: true } : t);
    setThreads(updatedThreads);

    if (selectedThreadId === threadId) setSelectedThreadId(null);
    if (selectedThreadIds.includes(threadId)) setSelectedThreadIds(prev => prev.filter(id => id !== threadId));
    
    closeUndo(); // Close any existing undo first
    setUndoState({
        message: "Thread archived.",
        onUndo: () => {
            setThreads(originalThreads);
            closeUndo();
        }
    });
    undoTimeoutRef.current = window.setTimeout(() => setUndoState(null), 5000);
  };

  const handleDeleteThread = (threadId: string) => {
      const originalThreads = [...threads];
      const updatedThreads = originalThreads.filter(t => t.id !== threadId);
      setThreads(updatedThreads);

      if (selectedThreadId === threadId) setSelectedThreadId(null);
      
      closeUndo();
      setUndoState({
        message: "Thread deleted.",
        onUndo: () => {
            setThreads(originalThreads);
            closeUndo();
        }
    });
    undoTimeoutRef.current = window.setTimeout(() => setUndoState(null), 5000);
  };
  
  const handleMarkAsReadThread = (threadId: string, isRead: boolean) => {
      setThreads(prev => prev.map(t => t.id === threadId ? { ...t, isRead } : t));
  };
  
  const handleToggleStarThread = (threadId: string) => {
      setThreads(prev => prev.map(t => t.id === threadId ? { ...t, isStarred: !t.isStarred } : t));
  };
  
  const handleMoveToJunk = (threadId: string) => {
    console.log(`Moving thread ${threadId} to Junk`);
    // For this demo, moving to junk will be the same as archiving
    handleArchiveThread(threadId);
  };

  const handleMuteThread = (threadId: string) => {
    console.log(`Muting thread ${threadId}. This would typically hide it from the inbox.`);
  };

  const handleBlockSender = (threadId: string) => {
    const thread = threads.find(t => t.id === threadId);
    if (thread) {
        const sender = thread.participants[0];
        console.log(`Blocking sender: ${sender.name} (${sender.email}). Future emails would be filtered.`);
    }
  };

  // --- Bulk Actions ---
  const handleBulkMarkAsRead = () => {
    setThreads(prev =>
      prev.map(t =>
        selectedThreadIds.includes(t.id) ? { ...t, isRead: true } : t
      )
    );
    setSelectedThreadIds([]);
  };

  const handleBulkDelete = () => {
    setThreads(prev => prev.filter(t => !selectedThreadIds.includes(t.id)));
    if (selectedThreadId && selectedThreadIds.includes(selectedThreadId)) {
        setSelectedThreadId(null);
    }
    setSelectedThreadIds([]);
  };

  const handleBulkArchive = () => {
    setThreads(prev => prev.map(t => selectedThreadIds.includes(t.id) ? { ...t, isArchived: true } : t));
    if (selectedThreadId && selectedThreadIds.includes(selectedThreadId)) {
        setSelectedThreadId(null);
    }
    setSelectedThreadIds([]);
  };

  const handleSelectThread = (id: string) => {
    // Mark as read on select
    setThreads(prev => 
        prev.map(t => t.id === id && !t.isRead ? { ...t, isRead: true } : t)
    );

    setSelectedThreadId(id);
    setSelectedThreadIds([]); // Clear bulk selection
    setThreadSummary({ threadId: null, summary: null, isLoading: false, error: null });

    // Mobile view
    if (window.innerWidth < 768) {
      // This behavior is handled in EmailView now to account for searching
    }
  };
  
  const handleBack = () => {
    setSelectedThreadId(null);
  }

  const toggleEmailSidebar = () => {
    setIsEmailSidebarOpen(prevState => !prevState);
  };

  const toggleAIAssistant = () => {
    setIsAIAssistantOpen(prev => {
        if (prev) { // if closing
            setAiAssistantMode('default');
        }
        return !prev;
    });
  }

  const handleCloseAIAssistant = () => {
    setIsAIAssistantOpen(false);
    setAiAssistantMode('default');
  }
  
  const handleScheduleMeeting = () => {
    setAiAssistantMode('scheduleMeeting');
    setIsAIAssistantOpen(true);
  }

  const handleOpenSnooze = (threadId: string, anchorEl: HTMLElement) => {
    setSnoozeTarget({ threadId, anchorEl });
  };

  const handleCloseSnooze = () => {
    setSnoozeTarget(null);
  };
  
  const handleOpenComposer = () => {
    setIsComposerOpen(true);
    setIsComposerMinimized(false);
    setIsComposerMaximized(false);
  };

  const handleCloseComposer = () => {
    // Confirmation logic is inside composer, so we just reset state here
    setIsComposerOpen(false);
    setComposerState(null);
    setIsComposerMinimized(false);
    setIsComposerMaximized(false);
  };
  
  const handleToggleMinimizeComposer = () => {
    setIsComposerMinimized(prev => !prev);
  };

  const handleToggleMaximizeComposer = () => {
      setIsComposerMaximized(prev => !prev);
  };

  const handleSendEmail = (email: { to: string, cc: string, bcc: string, subject: string, body: string, attachments: File[] }) => {
      console.log("✅ Email Sent!", {
          ...email,
          attachments: email.attachments.map(f => f.name) // Log file names for brevity
      });
      // In a real app, you'd call an API here.
      // Reset composer state after sending
      handleCloseComposer();
  };

  const handleComposeInteraction = (thread: Thread, type: 'reply' | 'reply-all' | 'forward', messageToReplyTo?: Message) => {
    const lastMessage = thread.messages[thread.messages.length - 1];
    const messageToQuote = messageToReplyTo || lastMessage;

    let to = '';
    let subject = '';
    
    const cleanedBody = messageToQuote.body
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>\s*<p>/gi, '\n\n')
      .replace(/<p>|<\/p>/gi, '')
      .replace(/<[^>]*>/g, '') // strip any other tags
      .trim();
      
    const quotedBody = cleanedBody.split('\n').map(line => `> ${line}`).join('\n');

    const originalBody = `\n\n\n--- On ${new Date(messageToQuote.timestamp).toLocaleString()}, ${messageToQuote.sender.name} wrote: ---\n${quotedBody}`;


    switch (type) {
        case 'reply':
            to = messageToQuote.sender.email;
            subject = thread.subject.startsWith('Re:') ? thread.subject : `Re: ${thread.subject}`;
            break;
        case 'reply-all':
            to = thread.participants
                .filter(p => p.email !== you.email)
                .map(p => p.email)
                .join(', ');
            subject = thread.subject.startsWith('Re:') ? thread.subject : `Re: ${thread.subject}`;
            break;
        case 'forward':
            to = '';
            subject = thread.subject.startsWith('Fwd:') ? thread.subject : `Fwd: ${thread.subject}`;
            break;
    }

    setComposerState({ to, subject, body: originalBody });
    handleOpenComposer();
  };

  const handleOpenContextMenu = (event: React.MouseEvent, threadId: string) => {
    event.preventDefault();
    setContextMenuTarget({ x: event.clientX, y: event.clientY, threadId });
  };

  const handleCloseContextMenu = () => {
    setContextMenuTarget(null);
  };

  const handleOpenKebabMenu = (threadId: string, anchorEl: HTMLElement) => {
    const rect = anchorEl.getBoundingClientRect();
    // Position menu slightly below and aligned with the anchor's right edge
    setKebabMenuTarget({ x: rect.right - 256, y: rect.bottom + 4, threadId });
  };

  const handleCloseKebabMenu = () => {
    setKebabMenuTarget(null);
  };

  const handleSnoozeThread = (until: Date) => {
    if (!snoozeTarget && !contextMenuTarget) return;
    const threadId = snoozeTarget?.threadId || contextMenuTarget?.threadId;
    if (!threadId) return;

    setThreads(prevThreads => 
        prevThreads.map(t => 
            t.id === threadId 
                ? { ...t, snoozedUntil: until.toISOString() } 
                : t
        )
    );
    
    if (selectedThreadId === threadId) {
        setSelectedThreadId(null);
    }
    
    handleCloseSnooze();
    handleCloseContextMenu();
  };

  const handleUnsnoozeThread = (threadId: string) => {
    setThreads(prevThreads => 
        prevThreads.map(t => 
            t.id === threadId 
                ? { ...t, snoozedUntil: undefined } 
                : t
        )
    );
  };
  
  const handleNavigateEmail = (view: string, domain?: Domain) => {
    setActiveEmailView(view);
    if (domain) {
        setActiveDomain(domain);
    }
    setSelectedThreadId(null); // Deselect thread when changing folder
    setSelectedThreadIds([]); // Clear bulk selection
    if (window.innerWidth < 768) {
        setIsEmailSidebarOpen(false);
    }
  };
  
  const handleSummarizeThread = async () => {
    if (!selectedThread || !ai) return;

    setThreadSummary({
        threadId: selectedThread.id,
        summary: null,
        isLoading: true,
        error: null,
    });

    try {
        const threadContent = selectedThread.messages.map(m => `${m.sender.name}: ${m.body.replace(/<[^>]*>/g, '')}`).join('\n');
        const prompt = `Provide a concise, bulleted summary of the key points and any action items from the following email thread. Use markdown for formatting.\n\n${threadContent}`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        setThreadSummary({
            threadId: selectedThread.id,
            summary: response.text,
            isLoading: false,
            error: null,
        });

    } catch (e) {
        console.error('Failed to summarize thread', e);
        setThreadSummary({
            threadId: selectedThread.id,
            summary: null,
            isLoading: false,
            error: 'Could not generate summary. Please try again.',
        });
    }
  };

  const handleOpenSearchFilters = (anchorEl: HTMLElement) => {
    setSearchFilterAnchorEl(anchorEl);
    setIsSearchFilterOpen(true);
  };
  
  const handleCloseSearchFilters = () => {
    setSearchFilterAnchorEl(null);
    setIsSearchFilterOpen(false);
  };
  
  const handleApplySearchFilters = (newFilters: Omit<SearchFilters, 'query'>) => {
      setSearchFilters(prev => ({ ...prev, ...newFilters }));
  };
  
  const handleSearchQueryChange = (query: string) => {
      setSearchFilters(prev => ({ ...prev, query }));
  };

  const { filteredThreads, isSearching, areFiltersActive } = useMemo(() => {
    const now = currentTime;
    const isSnoozed = (t: Thread) => t.snoozedUntil && new Date(t.snoozedUntil) > now;
    
    let baseFilteredThreads: Thread[];

    switch (activeEmailView) {
      case 'inbox':
        baseFilteredThreads = threads.filter(t => 
          t.account === activeDomain &&
          !t.isArchived &&
          ['primary', 'promotions', 'social', 'updates', 'forums'].includes(t.category) && 
          !isSnoozed(t)
        );
        break;
      case 'todos':
        baseFilteredThreads = threads.filter(t => t.category === 'todos' && !isSnoozed(t));
        break;
      case 'starred':
        baseFilteredThreads = threads.filter(t => t.isStarred && !isSnoozed(t));
        break;
      case 'snoozed':
        baseFilteredThreads = threads.filter(t => isSnoozed(t));
        break;
      case 'all-sent':
        baseFilteredThreads = threads.filter(t => 
            !t.subject.startsWith('(Draft)') &&
            t.messages.length > 0 && 
            (t.messages[t.messages.length - 1].sender.email === you.email || t.messages[t.messages.length - 1].sender.email === youLiverpool.email)
        );
        break;
      case 'sent':
        const currentUserEmail = activeDomain === 'hogwarts' ? you.email : youLiverpool.email;
        baseFilteredThreads = threads.filter(t => 
            t.account === activeDomain && 
            t.messages.length > 0 && 
            t.messages[t.messages.length - 1].sender.email === currentUserEmail && 
            !t.subject.startsWith('(Draft)')
        );
        break;
      case 'drafts':
        baseFilteredThreads = threads.filter(t => t.account === activeDomain && t.subject.startsWith('(Draft)'));
        break;
      case 'archive':
        baseFilteredThreads = threads.filter(t => t.account === activeDomain && t.isArchived);
        break;
      case 'folders':
        baseFilteredThreads = [];
        break;
      case 'finance':
      case 'feedback':
      case 'travel':
        baseFilteredThreads = threads.filter(t => t.category === activeEmailView && !isSnoozed(t));
        break;
      default:
        baseFilteredThreads = threads.filter(t => 
          t.account === activeDomain && !t.isArchived &&
          ['primary', 'promotions', 'social', 'updates', 'forums'].includes(t.category) && 
          !isSnoozed(t)
        );
    }
    
    // --- Start Search Filtering ---
    const queryActive = !!searchFilters.query.trim();
    const advancedFiltersActive = !!searchFilters.sender.trim() || searchFilters.dateRange !== 'any' || searchFilters.status !== 'any';
    const searching = queryActive || advancedFiltersActive;

    let searchFilteredThreads = searching ? threads : baseFilteredThreads;

    if (searching) {
      if (queryActive) {
        const query = searchFilters.query.toLowerCase();
        searchFilteredThreads = searchFilteredThreads.filter(t => 
          t.subject.toLowerCase().includes(query) ||
          t.participants.some(p => p.name.toLowerCase().includes(query)) ||
          t.messages.some(m => m.body.replace(/<[^>]*>/g, '').toLowerCase().includes(query))
        );
      }
      
      if (searchFilters.sender.trim()) {
          const sender = searchFilters.sender.toLowerCase();
          searchFilteredThreads = searchFilteredThreads.filter(t =>
              t.participants.some(p => p.name.toLowerCase().includes(sender) || p.email.toLowerCase().includes(sender))
          );
      }

      if (searchFilters.status === 'read') {
          searchFilteredThreads = searchFilteredThreads.filter(t => t.isRead);
      } else if (searchFilters.status === 'unread') {
          searchFilteredThreads = searchFilteredThreads.filter(t => !t.isRead);
      }

      if (searchFilters.dateRange !== 'any') {
          const startDate = new Date();
          if (searchFilters.dateRange === '7d') {
              startDate.setDate(startDate.getDate() - 7);
          } else if (searchFilters.dateRange === '30d') {
              startDate.setDate(startDate.getDate() - 30);
          }
          searchFilteredThreads = searchFilteredThreads.filter(t => new Date(t.timestamp) >= startDate);
      }
    }
    // --- End Search Filtering ---


    const isAdvancedStatusFilterActive = searchFilters.status !== 'any';
    if (showUnreadOnly && !isAdvancedStatusFilterActive && !searching) {
        searchFilteredThreads = baseFilteredThreads.filter(t => !t.isRead);
    }

    return { filteredThreads: searchFilteredThreads, isSearching: searching, areFiltersActive: advancedFiltersActive };
  }, [threads, activeEmailView, currentTime, activeDomain, showUnreadOnly, searchFilters]);
  
  const snoozedCount = useMemo(() => {
      const now = currentTime;
      return threads.filter(t => t.snoozedUntil && new Date(t.snoozedUntil) > now).length;
  }, [threads, currentTime]);
  
  const unreadCounts = useMemo(() => {
    const now = currentTime;
    const isSnoozed = (t: Thread) => t.snoozedUntil && new Date(t.snoozedUntil) > now;
    const inboxThreads = threads.filter(t => !t.isArchived && ['primary', 'promotions', 'social', 'updates', 'forums'].includes(t.category) && !isSnoozed(t));
    
    return {
        hogwarts: inboxThreads.filter(t => t.account === 'hogwarts' && !t.isRead).length,
        liverpool: inboxThreads.filter(t => t.account === 'liverpool' && !t.isRead).length,
    }
  }, [threads, currentTime]);

  const totalUnread = unreadCounts.hogwarts + unreadCounts.liverpool;


  const handleNavigateModule = (module: Module) => {
    setActiveModule(module);
  }
  
  const currentUser = activeDomain === 'hogwarts' ? you : youLiverpool;
  
  const mapThemeToDarkModeOption = (t: string) => {
    if (t === 'system') return 'Match phone setting';
    if (t === 'dark') return 'On';
    if (t === 'light') return 'Off';
    return 'Match phone setting';
  };

  const mapDarkModeOptionToTheme = (option: string) => {
    if (option === 'Match phone setting') return 'system';
    if (option === 'On') return 'dark';
    if (option === 'Off') return 'light';
    return 'system';
  };

  const handleSetDarkModeOption = (option: string) => {
      setTheme(mapDarkModeOptionToTheme(option) as Theme);
  };

  const accounts = [
    { name: you.name, email: you.email, avatarUrl: you.avatarUrl },
    { name: youLiverpool.name, email: youLiverpool.email, avatarUrl: youLiverpool.avatarUrl },
  ];

  const appContextValue = {
    accounts,
    darkModeOption: mapThemeToDarkModeOption(theme),
    setDarkModeOption: handleSetDarkModeOption,
    initialSettingsView,
    setInitialSettingsView,
    setActiveModule: handleNavigateModule,
    activeDomain,
  };


  const renderActiveView = () => {
    switch (activeModule) {
        case 'email':
            return <EmailView 
                filteredThreads={filteredThreads}
                selectedThreadId={selectedThreadId}
                handleSelectThread={handleSelectThread}
                activeEmailView={activeEmailView}
                handleOpenSnooze={handleOpenSnooze}
                selectedThread={selectedThread}
                toggleAIAssistant={toggleAIAssistant}
                handleBack={handleBack}
                setIsDiscoverModalOpen={setIsDiscoverModalOpen}
                handleScheduleMeeting={handleScheduleMeeting}
                handleUnsnoozeThread={handleUnsnoozeThread}
                handleSummarizeThread={handleSummarizeThread}
                threadSummary={threadSummary}
                setThreadSummary={setThreadSummary}
                isAIAssistantOpen={isAIAssistantOpen}
                handleCloseAIAssistant={handleCloseAIAssistant}
                aiAssistantMode={aiAssistantMode}
                selectedThreadIds={selectedThreadIds}
                handleToggleSelection={handleToggleSelection}
                handleClearSelection={handleClearSelection}
                handleBulkArchive={handleBulkArchive}
                handleBulkDelete={handleBulkDelete}
                handleBulkMarkAsRead={handleBulkMarkAsRead}
                handleOpenContextMenu={handleOpenContextMenu}
                handleOpenKebabMenu={handleOpenKebabMenu}
                showUnreadOnly={showUnreadOnly}
                onToggleUnreadFilter={() => setShowUnreadOnly(prev => !prev)}
                handleComposeInteraction={handleComposeInteraction}
                handleArchiveThread={handleArchiveThread}
                handleDeleteThread={handleDeleteThread}
                handleMarkAsReadThread={handleMarkAsReadThread}
                handleToggleStarThread={handleToggleStarThread}
                searchQuery={searchFilters.query}
                onSearchQueryChange={handleSearchQueryChange}
                onOpenSearchFilters={handleOpenSearchFilters}
                isSearching={isSearching}
                areFiltersActive={areFiltersActive}
                toggleEmailSidebar={toggleEmailSidebar}
                onNavigate={handleNavigateEmail}
                onCompose={handleOpenComposer}
                isMobile={isMobile}
                currentUser={currentUser}
            />;
        case 'copilot':
            return isMobile ? <CopilotViewMobile /> : <CopilotView />;
        case 'chat':
            return isMobile ? <ChatViewMobile /> : <ChatView />;
        case 'settings':
            return isMobile ? <SettingsViewMobile isOpen={activeModule === 'settings'} onClose={() => handleNavigateModule('email')} /> : <SettingsView theme={theme} setTheme={setTheme} />;
        case 'drive':
             return <DriveView />;
        case 'design-system':
            return isMobile ? <DesignSystemViewMobile /> : <DesignSystemView />;
        default:
            return null;
    }
  };
  
  // Mobile view
  const showEmailDetailOnMobile = isMobile && activeModule === 'email' && !!selectedThreadId;

  if (!isOnboardingComplete) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (isMobile && isComposerOpen) {
    return (
      <ComposerMobile
        onClose={handleCloseComposer}
        initialState={composerState}
        onSend={handleSendEmail}
      />
    );
  }

  return (
    <AppContext.Provider value={appContextValue}>
      <div className="h-dvh w-screen flex overflow-hidden">
        {!isMobile && <Composer 
          isOpen={isComposerOpen} 
          onClose={handleCloseComposer} 
          initialState={composerState} 
          isMinimized={isComposerMinimized} 
          isMaximized={isComposerMaximized}
          onToggleMinimize={handleToggleMinimizeComposer}
          onToggleMaximize={handleToggleMaximizeComposer}
          onSend={handleSendEmail}
        />
        }
        {isMobile ? (
          <DiscoverModalMobile isOpen={isDiscoverModalOpen} onClose={() => setIsDiscoverModalOpen(false)} />
        ) : (
          <DiscoverModal isOpen={isDiscoverModalOpen} onClose={() => setIsDiscoverModalOpen(false)} />
        )}
        <AIAssistantModal
            isOpen={isAIAssistantOpen}
            onClose={handleCloseAIAssistant}
            selectedThread={selectedThread}
            mode={aiAssistantMode}
        />
        {snoozeTarget && (
          <SnoozePopover 
              anchorEl={snoozeTarget.anchorEl}
              onClose={handleCloseSnooze}
              onSnooze={handleSnoozeThread}
          />
        )}
        {isSearchFilterOpen && searchFilterAnchorEl && (
          <SearchFilterPopover 
              anchorEl={searchFilterAnchorEl}
              onClose={handleCloseSearchFilters}
              filters={{ sender: searchFilters.sender, dateRange: searchFilters.dateRange, status: searchFilters.status }}
              onApply={handleApplySearchFilters}
          />
        )}
        {contextMenuTarget && (
          <EmailContextMenu
              x={contextMenuTarget.x}
              y={contextMenuTarget.y}
              thread={threads.find(t => t.id === contextMenuTarget.threadId) || null}
              onClose={handleCloseContextMenu}
              onArchive={handleArchiveThread}
              onDelete={handleDeleteThread}
              onMarkAsRead={handleMarkAsReadThread}
              onToggleStar={handleToggleStarThread}
              onSnooze={handleOpenSnooze}
              onMoveToJunk={handleMoveToJunk}
              onMute={handleMuteThread}
              onBlockSender={handleBlockSender}
              onToggleSelection={handleToggleSelection}
          />
        )}
        {kebabMenuTarget && (
          <KebabMenu
              x={kebabMenuTarget.x}
              y={kebabMenuTarget.y}
              thread={threads.find(t => t.id === kebabMenuTarget.threadId) || null}
              onClose={handleCloseKebabMenu}
              onArchive={handleArchiveThread}
              onDelete={handleDeleteThread}
              onMarkAsRead={handleMarkAsReadThread}
              onRemindMe={handleOpenSnooze}
              onMoveToJunk={handleMoveToJunk}
              onMute={handleMuteThread}
              onBlockSender={handleBlockSender}
              onComposeInteraction={(thread, type) => {
                  if (thread) handleComposeInteraction(thread, type)
              }}
          />
        )}
        <PrimarySidebar activeModule={activeModule} onNavigate={handleNavigateModule} />
          
        {activeModule === 'email' && 
          <div className="md:flex h-full flex-shrink-0 relative">
              <Sidebar 
                  width={isMobile ? 280 : sidebarWidth}
                  isSidebarOpen={isMobile ? isEmailSidebarOpen : true}
                  activeView={activeEmailView} 
                  activeDomain={activeDomain}
                  onNavigate={handleNavigateEmail}
                  snoozedCount={snoozedCount}
                  unreadCounts={unreadCounts}
                  totalUnread={totalUnread}
                  onComposeClick={handleOpenComposer}
              />
              <Resizer onMouseDown={handleSidebarMouseDown} className="hidden md:flex" />
          </div>
        }
        
        {activeModule === 'email' && isEmailSidebarOpen && (
          // Mobile view
          <div 
            onClick={toggleEmailSidebar}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            aria-hidden="true"
          ></div>
        )}
        
        <main className="flex-1 flex flex-col min-w-0 min-h-0">
           <div key={activeModule} className="flex-1 flex flex-col min-w-0 animate-fadeIn overflow-hidden">
              {renderActiveView()}
           </div>
        </main>

        {undoState && (
          isMobile ? (
            <UndoSnackbarMobile 
              message={undoState.message} 
              onUndo={undoState.onUndo} 
              onClose={closeUndo}
            />
          ) : (
            <UndoSnackbar 
              message={undoState.message} 
              onUndo={undoState.onUndo} 
              onClose={closeUndo}
            />
          )
        )}

         {/* Mobile view */}
         {showEmailDetailOnMobile && selectedThread ? (
          <EmailDetailActionBar 
              thread={selectedThread}
              onComposeInteraction={(thread, type) => handleComposeInteraction(thread, type)}
              onArchive={handleArchiveThread}
              onDelete={handleDeleteThread}
          />
        ) : activeModule !== 'settings' ? (
          <MobileBottomNav activeModule={activeModule} onNavigate={handleNavigateModule} />
        ) : null}
      </div>
    </AppContext.Provider>
  );
};

export default App;
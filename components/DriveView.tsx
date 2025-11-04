import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MOCK_DRIVE_FILES, you } from '../constants';
import type { DriveFile } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

// --- Helper Functions & Components ---

const FileIcon: React.FC<{ type: DriveFile['type'] }> = ({ type }) => {
    const iconMap: Record<DriveFile['type'], { icon: string, color: string }> = {
        folder: { icon: 'fa-solid fa-folder', color: 'text-yellow-500' },
        document: { icon: 'fa-solid fa-file-word', color: 'text-blue-500' },
        spreadsheet: { icon: 'fa-solid fa-file-excel', color: 'text-green-500' },
        presentation: { icon: 'fa-solid fa-file-powerpoint', color: 'text-orange-500' },
        pdf: { icon: 'fa-solid fa-file-pdf', color: 'text-red-500' },
        image: { icon: 'fa-solid fa-file-image', color: 'text-purple-500' },
        video: { icon: 'fa-solid fa-file-video', color: 'text-pink-500' },
    };
    const { icon, color } = iconMap[type] || { icon: 'fa-solid fa-file', color: 'text-muted-foreground' };
    return <i className={`${icon} ${color} w-6 h-6 text-xl`}></i>;
};

const formatBytes = (bytes?: number, decimals = 2) => {
    if (!bytes) return '—';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const FileGrid: React.FC<{ files: DriveFile[] }> = ({ files }) => {
    if (files.length === 0) {
        return (
            <div className="border border-border rounded-lg p-10 text-center text-muted-foreground">
                <p>No files in this view.</p>
            </div>
        );
    }
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {files.map(file => (
                <div key={file.id} className="bg-card p-4 rounded-xl border border-border hover:bg-accent cursor-pointer transition-colors">
                    <div className="flex items-center space-x-3">
                        <FileIcon type={file.type} />
                        <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

const FileList: React.FC<{ files: DriveFile[] }> = ({ files }) => {
    if (files.length === 0) {
        return (
            <div className="border border-border rounded-lg p-10 text-center text-muted-foreground">
                <p>No files in this view.</p>
            </div>
        );
    }
    return (
        <div className="border border-border rounded-lg">
            <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground">
                    <tr>
                        <th className="p-3 font-medium">Name</th>
                        {/* Mobile view */}
                        <th className="p-3 font-medium hidden md:table-cell">Owner</th>
                        {/* Mobile view */}
                        <th className="p-3 font-medium hidden lg:table-cell">Last modified</th>
                        {/* Mobile view */}
                        <th className="p-3 font-medium hidden sm:table-cell">File size</th>
                    </tr>
                </thead>
                <tbody>
                    {files.map((file, idx) => (
                        <tr key={file.id} className={`border-t border-border hover:bg-accent ${idx === 0 ? 'border-t-0' : ''}`}>
                            <td className="p-3 font-medium text-foreground">
                                <div className="flex items-center space-x-3">
                                    <FileIcon type={file.type} />
                                    <span>{file.name}</span>
                                </div>
                            </td>
                            {/* Mobile view */}
                            <td className="p-3 text-muted-foreground hidden md:table-cell">{file.owner.name === you.name ? 'me' : file.owner.name}</td>
                            {/* Mobile view */}
                            <td className="p-3 text-muted-foreground hidden lg:table-cell">{formatDate(file.lastModified)}</td>
                            {/* Mobile view */}
                            <td className="p-3 text-muted-foreground hidden sm:table-cell">{formatBytes(file.size)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const FileListView: React.FC<{ 
    title: string; 
    files: DriveFile[];
    viewMode: 'list' | 'grid';
    onViewModeChange: () => void;
}> = ({ title, files, viewMode, onViewModeChange }) => (
    <section className="animate-fadeIn">
        <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-medium text-foreground">{title}</h2>
            <div className="flex items-center space-x-2 text-muted-foreground">
                <Button variant="ghost" size="icon" title="Sort options"><i className="fa-solid fa-arrow-down-a-z w-5 h-5"></i></Button>
                <Button variant="ghost" size="icon" onClick={onViewModeChange} title={viewMode === 'list' ? "Grid view" : "List view"}>
                    {viewMode === 'list' ? <i className="fa-solid fa-grip w-5 h-5"></i> : <i className="fa-solid fa-list w-5 h-5"></i>}
                </Button>
            </div>
        </div>
        {viewMode === 'list' ? <FileList files={files} /> : <FileGrid files={files} />}
    </section>
);

const EmptyView: React.FC<{ icon: string; title: string; description: string; }> = ({ icon, title, description }) => (
    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4 animate-fadeIn">
        <i className={`${icon} text-6xl mb-4`}></i>
        <p className="text-xl font-medium text-foreground">{title}</p>
        <p className="text-sm mt-1 max-w-xs">{description}</p>
    </div>
);

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

// --- Main DriveView Component ---

const DriveView: React.FC = () => {
    const [files, setFiles] = useState<DriveFile[]>(MOCK_DRIVE_FILES);
    const [activeView, setActiveView] = useState('mydrive');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    // Mobile view
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    // Mobile view
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Mobile view
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFiles = event.target.files;
        if (uploadedFiles) {
            const newDriveFiles: DriveFile[] = Array.from(uploadedFiles).map((file: File) => {
                let type: DriveFile['type'] = 'document';
                if (file.type.startsWith('image/')) type = 'image';
                else if (file.type.startsWith('video/')) type = 'video';
                else if (file.type === 'application/pdf') type = 'pdf';
                else if (file.type.includes('spreadsheet') || file.type.includes('excel')) type = 'spreadsheet';
                else if (file.type.includes('presentation') || file.type.includes('powerpoint')) type = 'presentation';
                
                return {
                    id: `df-${Date.now()}-${file.name}`,
                    name: file.name,
                    type: type,
                    owner: you,
                    lastModified: new Date().toISOString(),
                    size: file.size,
                    isStarred: false,
                    path: '/',
                };
            });
            
            setFiles(prevFiles => [...newDriveFiles, ...prevFiles]);
        }
        if (event.target) {
            event.target.value = '';
        }
    };

    const handleViewModeChange = () => {
        setViewMode(prev => prev === 'list' ? 'grid' : 'list');
    };

    const handleNavigate = (view: string) => {
        setActiveView(view);
        // Mobile view
        if (isMobile) {
            setIsSidebarOpen(false);
        }
    };

    const renderContent = useMemo(() => {
        switch (activeView) {
            case 'mydrive': {
                const quickAccessFiles = files.filter(f => f.isStarred).slice(0, 4);
                const mainFiles = files.filter(f => f.path === '/');
                return (
                    <div className="animate-fadeIn">
                        <section>
                            <h2 className="text-lg font-medium text-foreground mb-3">Quick Access</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {quickAccessFiles.map(file => (
                                    <div key={file.id} className="bg-card p-4 rounded-xl border border-border hover:bg-accent cursor-pointer transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <FileIcon type={file.type} />
                                            <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                        <section className="mt-8">
                             <div className="flex justify-between items-center mb-3">
                                <h2 className="text-lg font-medium text-foreground">My Drive</h2>
                                <div className="flex items-center space-x-2 text-muted-foreground">
                                    <Button variant="ghost" size="icon" title="Sort options"><i className="fa-solid fa-arrow-down-a-z w-5 h-5"></i></Button>
                                    <Button variant="ghost" size="icon" onClick={handleViewModeChange} title={viewMode === 'list' ? "Grid view" : "List view"}>
                                        {viewMode === 'list' ? <i className="fa-solid fa-grip w-5 h-5"></i> : <i className="fa-solid fa-list w-5 h-5"></i>}
                                    </Button>
                                </div>
                            </div>
                           {viewMode === 'list' ? <FileList files={mainFiles} /> : <FileGrid files={mainFiles} />}
                        </section>
                    </div>
                );
            }
            case 'computers':
                return <EmptyView icon="fa-solid fa-computer" title="No computers syncing" description="Install PostaGate Drive on your computer to see your files here." />;
            case 'shared': {
                const sharedFiles = files.filter(f => f.owner.email !== you.email);
                return <FileListView title="Shared with me" files={sharedFiles} viewMode={viewMode} onViewModeChange={handleViewModeChange} />;
            }
            case 'recent': {
                const recentFiles = [...files].sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
                return <FileListView title="Recent" files={recentFiles} viewMode={viewMode} onViewModeChange={handleViewModeChange} />;
            }
            case 'starred': {
                const starredFiles = files.filter(f => f.isStarred);
                return <FileListView title="Starred" files={starredFiles} viewMode={viewMode} onViewModeChange={handleViewModeChange} />;
            }
            case 'trash':
                return <EmptyView icon="fa-solid fa-trash" title="Trash is empty" description="Items in trash will be permanently deleted after 30 days." />;
            default:
                return <EmptyView icon="fa-solid fa-question-circle" title="Unknown View" description="Something went wrong." />;
        }
    }, [activeView, files, viewMode]);

    return (
        <div className="flex h-full w-full bg-background text-foreground overflow-hidden">
            {/* Drive Sidebar */}
            {/* Mobile view */}
            <aside className={cn(
                "w-[280px] bg-card border-r border-border flex-shrink-0 flex-col p-4 backdrop-blur-xl h-full transition-transform duration-300 ease-in-out md:relative md:translate-x-0 absolute z-50",
                isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            )}>
                <div className="mb-6">
                    <Button onClick={handleUploadClick} className="w-full text-lg shadow-md" size="lg">
                        <i className="fa-solid fa-upload mr-2"></i>
                        <span>Upload</span>
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        multiple
                        className="hidden"
                        aria-hidden="true"
                    />
                </div>
                <nav className="flex-1 space-y-1">
                    <NavItem icon={<i className="fa-solid fa-hard-drive w-5 h-5"></i>} label="My Drive" view="mydrive" activeView={activeView} onNavigate={handleNavigate} />
                    <NavItem icon={<i className="fa-solid fa-computer w-5 h-5"></i>} label="My computer" view="computers" activeView={activeView} onNavigate={handleNavigate} />
                    <NavItem icon={<i className="fa-solid fa-users w-5 h-5"></i>} label="Shared with me" view="shared" activeView={activeView} onNavigate={handleNavigate} />
                    <NavItem icon={<i className="fa-regular fa-clock w-5 h-5"></i>} label="Recent" view="recent" activeView={activeView} onNavigate={handleNavigate} />
                    <NavItem icon={<i className="fa-regular fa-star w-5 h-5"></i>} label="Starred" view="starred" activeView={activeView} onNavigate={handleNavigate} />
                    <NavItem icon={<i className="fa-solid fa-trash w-5 h-5"></i>} label="Trash" view="trash" activeView={activeView} onNavigate={handleNavigate} />
                </nav>
                <div className="mt-auto">
                    <div className="p-3 bg-secondary rounded-lg">
                        <div className="flex justify-between items-center text-sm font-medium mb-1">
                            <span className="text-secondary-foreground">Storage</span>
                            <span className="text-muted-foreground">7.8 GB of 15 GB used</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5">
                            <div className="bg-primary h-1.5 rounded-full" style={{ width: '52%' }}></div>
                        </div>
                        <Button variant="secondary" className="w-full mt-3 bg-background hover:bg-accent">
                            Get more storage
                        </Button>
                    </div>
                </div>
            </aside>
            
            {/* Mobile view */}
            {isMobile && isSidebarOpen && (
                <div 
                    onClick={() => setIsSidebarOpen(false)} 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                    aria-hidden="true"
                ></div>
            )}

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 backdrop-blur-xl">
                <header className="p-2 md:p-4 flex items-center justify-between flex-shrink-0 border-b border-border">
                    <div className="flex items-center flex-1">
                        {/* Mobile view */}
                        <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={() => setIsSidebarOpen(true)}>
                            <i className="fa-solid fa-bars w-5 h-5"></i>
                        </Button>
                        <div className="relative flex-1 max-w-2xl">
                            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"></i>
                            <Input type="text" placeholder="Search in Drive" className="w-full bg-secondary border-none rounded-full pl-12 pr-4 h-12 text-md text-foreground placeholder-muted-foreground" />
                        </div>
                    </div>
                    <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="icon" className="text-muted-foreground"><i className="fa-regular fa-circle-question w-5 h-5"></i></Button>
                        <Button variant="ghost" size="icon" className="text-muted-foreground"><i className="fa-solid fa-gear w-5 h-5"></i></Button>
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto p-6">
                   {renderContent}
                </div>
            </main>
        </div>
    );
};

const NavItem: React.FC<{ icon: React.ReactNode; label: string; view: string; activeView: string; onNavigate: (view: string) => void; }> = ({ icon, label, view, activeView, onNavigate }) => {
  const active = activeView === view;
  return (
    <button onClick={() => onNavigate(view)} className={`w-full flex items-center space-x-4 px-3 py-2.5 text-sm font-medium rounded-r-full -ml-4 transition-all duration-200 text-left ${active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}>
      {icon}
      <span>{label}</span>
    </button>
  );
};


export default DriveView;
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Download, Upload, ExternalLink, X, MonitorPlay, Menu } from 'lucide-react';
import { AppLink } from './types';

const DEFAULT_LINKS: AppLink[] = [
  { id: 'home', title: 'KILAS SISRA SMPN 7', url: 'internal://home' },
];

export default function App() {
  const [links, setLinks] = useState<AppLink[]>(() => {
    const saved = localStorage.getItem('sisra_links_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_LINKS;
      }
    }
    return DEFAULT_LINKS;
  });

  const [activeLinkId, setActiveLinkId] = useState<string | null>(links.length > 0 ? links[0].id : null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('sisra_links_v1', JSON.stringify(links));
  }, [links]);

  const activeLink = links.find(l => l.id === activeLinkId);

  const handleAddLink = (title: string, url: string) => {
    let formattedUrl = url;
    if (!/^https?:\/\//i.test(url)) {
      formattedUrl = 'https://' + url;
    }
    const newLink: AppLink = {
      id: Date.now().toString(),
      title,
      url: formattedUrl,
    };
    setLinks([...links, newLink]);
    setActiveLinkId(newLink.id);
    setIsAddModalOpen(false);
  };

  const handleRemoveLink = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newLinks = links.filter(l => l.id !== id);
    setLinks(newLinks);
    if (activeLinkId === id) {
      setActiveLinkId(newLinks.length > 0 ? newLinks[0].id : null);
    }
  };

  const handleBackup = () => {
    const dataStr = JSON.stringify(links, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `dashboard_backup_${new Date().toISOString().slice(0,10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          // Basic validation
          const validLinks = parsed.filter(item => item.id && item.title && item.url);
          if (validLinks.length > 0) {
            setLinks(validLinks);
            setActiveLinkId(validLinks[0].id);
          } else {
            alert('File backup tidak valid atau kosong.');
          }
        }
      } catch (err) {
        alert('Gagal membaca file backup. Pastikan format JSON benar.');
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans flex overflow-hidden selection:bg-emerald-500/30">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarMobileOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-30 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside 
        className={`fixed md:relative w-[280px] md:w-80 h-screen p-4 md:p-6 flex flex-col z-40 transition-transform duration-300 ease-out ${isSidebarMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="panel-3d flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-slate-700/50 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-slate-600/50 flex-shrink-0">
              <img 
                src="https://image2url.com/r2/default/images/1772635041239-5398e0e9-6dab-43c9-bdc7-6ea6097291f9.jpeg" 
                alt="App Dashboard Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight leading-tight">SISRA SMPN 7</h1>
              <p className="text-[10px] text-slate-400 font-medium mt-1 leading-tight">Sistem Informasi Sekolah<br/>Ramah Anak SMPN 7</p>
            </div>
          </div>

          {/* Link List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {links.map((link) => (
                <motion.button
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: -20 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  key={link.id}
                  onClick={() => { setActiveLinkId(link.id); setIsSidebarMobileOpen(false); }}
                  className={`btn-3d group ${activeLinkId === link.id ? 'active' : ''}`}
                >
                  <span className="truncate pr-2 text-sm font-semibold tracking-wide">{link.title}</span>
                  <div 
                    onClick={(e) => handleRemoveLink(link.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all"
                    title="Hapus Link"
                  >
                    <Trash2 className="w-4 h-4" />
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
            
            {links.length === 0 && (
              <div className="text-center py-10 text-slate-500 text-sm">
                Belum ada aplikasi.<br/>Tambahkan link baru.
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-700/50 space-y-3 bg-slate-800/50">
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span>Tambah Aplikasi</span>
            </button>
            
            <div className="flex gap-3">
              <button 
                onClick={handleBackup}
                className="flex-1 btn-action-3d group"
                title="Backup Links"
              >
                <Download className="w-4 h-4 mr-2 group-hover:text-emerald-400 transition-colors" />
                <span className="text-xs font-semibold">Backup</span>
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 btn-action-3d group"
                title="Restore Links"
              >
                <Upload className="w-4 h-4 mr-2 group-hover:text-blue-400 transition-colors" />
                <span className="text-xs font-semibold">Restore</span>
              </button>
              <input 
                type="file" 
                accept=".json" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleRestore}
              />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 md:pl-0 z-10 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between mb-4 bg-slate-800 p-3 rounded-2xl border border-slate-700/50 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md border border-slate-600/50 flex-shrink-0">
              <img 
                src="https://image2url.com/r2/default/images/1772635041239-5398e0e9-6dab-43c9-bdc7-6ea6097291f9.jpeg" 
                alt="Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight leading-tight">SISRA SMPN 7</h1>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5 leading-tight">Sistem Informasi Sekolah<br/>Ramah Anak SMPN 7</p>
            </div>
          </div>
          <button 
            onClick={() => setIsSidebarMobileOpen(true)} 
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="panel-3d flex-1 flex flex-col overflow-hidden relative"
        >
          {activeLink ? (
            <>
              <div className="h-12 bg-slate-800/80 border-b border-slate-700/50 flex items-center px-4 justify-between backdrop-blur-sm z-20">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                  {activeLink.title}
                </div>
                {activeLink.url !== 'internal://home' && (
                  <a 
                    href={activeLink.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-700/50 hover:border-emerald-500/30"
                  >
                    <span>Buka di Tab Baru</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              {activeLink.url === 'internal://home' ? (
                <div className="flex-1 bg-slate-900/50 p-6 md:p-10 overflow-y-auto flex items-center justify-center custom-scrollbar">
                  <div className="max-w-2xl w-full bg-slate-800/80 backdrop-blur-md rounded-3xl border border-slate-700/50 p-8 md:p-12 shadow-2xl">
                    <div className="text-center mb-10">
                      <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 mb-2">SISRA SMPN 7</h2>
                      <p className="text-lg md:text-xl text-slate-300 font-medium">(Sistem Informasi Sekolah Ramah Anak SMPN 7)</p>
                    </div>
                    
                    <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-700/50 mb-8 shadow-inner">
                      <p className="text-slate-300 leading-relaxed text-center md:text-lg">
                        Dirancang mendukung program SRA (Sekolah Ramah Anak) sesuai pedoman Kementerian Pemberdayaan Perempuan dan Perlindungan Anak.
                      </p>
                    </div>

                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
                        <span className="text-2xl">🎯</span> TUJUAN
                      </h3>
                      <ul className="space-y-4">
                        <li className="flex items-start gap-3 bg-slate-800/50 p-4 rounded-xl border border-slate-700/30 shadow-sm">
                          <span className="text-xl mt-0.5">✅</span>
                          <span className="text-slate-200 md:text-lg">Mewujudkan sekolah aman & inklusif</span>
                        </li>
                        <li className="flex items-start gap-3 bg-slate-800/50 p-4 rounded-xl border border-slate-700/30 shadow-sm">
                          <span className="text-xl mt-0.5">✅</span>
                          <span className="text-slate-200 md:text-lg">Mendokumentasikan seluruh layanan perlindungan anak</span>
                        </li>
                        <li className="flex items-start gap-3 bg-slate-800/50 p-4 rounded-xl border border-slate-700/30 shadow-sm">
                          <span className="text-xl mt-0.5">✅</span>
                          <span className="text-slate-200 md:text-lg">Integrasi BK, Kesiswaan, dan Prestasi</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 bg-white relative">
                  {/* Loader placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-0">
                    <div className="w-8 h-8 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin" />
                  </div>
                  <iframe 
                    key={activeLink.id} // Force reload on change
                    src={activeLink.url} 
                    className="w-full h-full border-none relative z-10 bg-white"
                    title={activeLink.title}
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                  />
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-4">
              <div className="w-20 h-20 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center shadow-inner">
                <MonitorPlay className="w-10 h-10 text-slate-600" />
              </div>
              <p className="text-lg font-medium">Pilih atau tambahkan aplikasi untuk memulai</p>
            </div>
          )}
        </motion.div>
      </main>

      {/* Add Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <AddLinkModal 
            onClose={() => setIsAddModalOpen(false)} 
            onAdd={handleAddLink} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function AddLinkModal({ onClose, onAdd }: { onClose: () => void, onAdd: (title: string, url: string) => void }) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && url.trim()) {
      onAdd(title.trim(), url.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="panel-3d w-full max-w-md relative z-10 overflow-hidden"
      >
        <div className="p-6 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/80">
          <h2 className="text-xl font-bold text-white">Tambah Aplikasi Baru</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 ml-1">Nama Aplikasi</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Misal: Wikipedia"
              className="input-3d"
              required
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 ml-1">URL / Link</label>
            <input 
              type="url" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="input-3d"
              required
            />
            <p className="text-xs text-slate-500 ml-1 mt-1">
              Catatan: Beberapa situs mungkin memblokir tampilan di dalam iframe.
            </p>
          </div>
          
          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-semibold text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors shadow-inner"
            >
              Batal
            </button>
            <button 
              type="submit"
              className="flex-1 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all"
            >
              Simpan
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
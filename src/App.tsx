import React, { useEffect, useState } from 'react';
import { Sun, Calendar, Send, History, CheckCircle2, Loader2, ArrowRight, Zap, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

interface Quote {
  id: number;
  date: string;
  content: string;
  author: string;
  sent_at: string | null;
}

export default function App() {
  const [todayQuote, setTodayQuote] = useState<Quote | null>(null);
  const [history, setHistory] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState<'today' | 'history'>('today');

  const fetchTodayQuote = async () => {
    try {
      const res = await fetch('/api/quotes/today');
      const data = await res.json();
      setTodayQuote(data);
    } catch (err) {
      console.error('Failed to fetch today quote', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/quotes/history');
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error('Failed to fetch history', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchTodayQuote(), fetchHistory()]);
      setLoading(false);
    };
    init();
  }, []);

  const handleTestSend = async () => {
    setSending(true);
    try {
      const res = await fetch('/api/test-send', { method: 'POST' });
      if (res.ok) {
        alert('Test notification sent! Please check your WeChat.');
        fetchTodayQuote();
      } else {
        alert('Failed to send. Please check your SERVERCHAN_SENDKEY configuration.');
      }
    } catch (err) {
      alert('An error occurred while sending.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111827] font-sans selection:bg-indigo-100">
      {/* Navigation */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <span className="font-bold tracking-tight text-lg">Morning Glow</span>
          </div>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('today')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'today' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'history' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Archive
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12 md:py-20">
        <AnimatePresence mode="wait">
          {activeTab === 'today' ? (
            <motion.div
              key="today"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start"
            >
              {/* Left Column: Quote Display */}
              <div className="lg:col-span-7 space-y-8">
                <header>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-4">
                    <Sun size={14} />
                    Daily Inspiration
                  </div>
                  <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
                    Start your <span className="text-indigo-600">day</span> with power.
                  </h2>
                </header>

                {todayQuote ? (
                  <div className="bg-white rounded-[40px] p-10 md:p-16 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] border border-gray-100 relative group">
                    <div className="absolute -top-6 -right-6 w-24 h-24 bg-indigo-600/5 rounded-full blur-2xl group-hover:bg-indigo-600/10 transition-all" />
                    
                    <blockquote className="relative">
                      <p className="text-2xl md:text-4xl leading-tight font-medium mb-10 text-gray-900">
                        "{todayQuote.content}"
                      </p>
                      <footer className="flex items-center gap-4">
                        <div className="w-10 h-px bg-indigo-200" />
                        <cite className="text-lg font-medium text-gray-500 not-italic">{todayQuote.author}</cite>
                      </footer>
                    </blockquote>
                  </div>
                ) : (
                  <div className="h-[400px] bg-gray-50 rounded-[40px] flex items-center justify-center border-2 border-dashed border-gray-200">
                    <p className="text-gray-400 font-medium">Fetching your morning light...</p>
                  </div>
                )}
              </div>

              {/* Right Column: Status & Controls */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                    <Bell size={14} />
                    Notification Status
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${todayQuote?.sent_at ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400'}`}>
                        <CheckCircle2 size={20} />
                      </div>
                      <div>
                        <p className="font-bold">{todayQuote?.sent_at ? 'Sent Successfully' : 'Pending Delivery'}</p>
                        <p className="text-sm text-gray-500">
                          {todayQuote?.sent_at 
                            ? `Delivered at ${format(new Date(todayQuote.sent_at), 'hh:mm a')}`
                            : 'Scheduled for tomorrow at 06:00 AM'
                          }
                        </p>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-50">
                      <button
                        onClick={handleTestSend}
                        disabled={sending}
                        className="w-full bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                      >
                        {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                        Send Test Notification
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Timezone</p>
                    <p className="font-bold">Asia/Shanghai</p>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Provider</p>
                    <p className="font-bold">ServerChan</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {history.map((item) => (
                <div key={item.id} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{item.date}</span>
                    {item.sent_at && <CheckCircle2 size={14} className="text-emerald-500" />}
                  </div>
                  <p className="text-xl font-bold leading-tight mb-6 text-gray-800 group-hover:text-indigo-600 transition-colors">
                    "{item.content}"
                  </p>
                  <p className="text-sm font-medium text-gray-400">— {item.author}</p>
                </div>
              ))}
              {history.length === 0 && (
                <div className="col-span-full text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                  <p className="text-gray-400 font-medium italic">Your archive is empty. The journey begins tomorrow.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-12 border-t border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-40">
            <Zap size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Powered by Gemini AI</span>
          </div>
          <div className="flex gap-8">
            <a href="https://sct.ftqq.com/" target="_blank" className="text-xs font-bold text-gray-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">ServerChan</a>
            <a href="#" className="text-xs font-bold text-gray-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">Documentation</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

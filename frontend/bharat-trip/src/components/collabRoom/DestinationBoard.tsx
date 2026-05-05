import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  MapPin, 
  ThumbsUp, 
  ThumbsDown, 
  Sparkles, 
  Lock, 
  Trophy,
  Trash2,
  Globe,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  fetchDestinations, 
  voteDestination, 
  lockDestination, 
  deleteDestination 
} from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { useSocket } from '@/context/SocketContext';
import AISuggestModal from './modals/AISuggestModal';
import AddDestinationModal from './modals/AddDestinationModal';

const COLORS = {
  bg: '#0e0e10',
  card: '#141416',
  border: '#2a2a2e',
  teal: '#1D9E75',
  coral: '#993C1D',
  purple: '#534AB7',
  text: '#e6edf3',
  textMuted: '#8b949e',
  leadingBg: '#04342C',
  leadingText: '#5DCAA5'
};

const DestinationBoard = ({ tripId, isOwner }: { tripId: string, isOwner: boolean }) => {
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const { user } = useAuth();
  const socket = useSocket();

  const loadData = async () => {
    try {
      const data = await fetchDestinations(tripId);
      setDestinations(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    if (socket) {
      socket.on('destination:added', () => loadData());
      socket.on('destination:voted', () => loadData());
      socket.on('destination:locked', () => loadData());
      socket.on('destination:deleted', () => loadData());

      return () => {
        socket.off('destination:added');
        socket.off('destination:voted');
        socket.off('destination:locked');
        socket.off('destination:deleted');
      };
    }
  }, [tripId, socket]);

  const handleVote = async (destId: string, type: 'up' | 'down') => {
    try {
      await voteDestination(tripId, destId, type);
    } catch (error) {
      toast.error('Failed to vote');
    }
  };

  const handleLock = async (destId: string) => {
    try {
      await lockDestination(tripId, destId);
      toast.success('Destination locked! 🔒');
    } catch (error) {
      toast.error('Failed to lock destination');
    }
  };

  const handleDelete = async (destId: string) => {
    try {
      await deleteDestination(tripId, destId);
      toast.success('Suggestion removed');
    } catch (error) {
      toast.error('Failed to remove suggestion');
    }
  };

  const lockedDest = destinations.find(d => d.status === 'locked');

  if (loading) return <div className="p-12 text-center text-muted-foreground"><Loader2 className="animate-spin mx-auto mb-4" /> Loading board...</div>;

  return (
    <div className="rounded-3xl bg-card border border-border p-8 shadow-soft relative overflow-visible mb-8">
      {/* Locked Banner */}
      <AnimatePresence>
        {lockedDest && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="mb-8 overflow-hidden"
          >
            <div style={{ border: `2px solid ${COLORS.teal}`, backgroundColor: `${COLORS.teal}10` }} className="rounded-2xl p-6 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="size-16 rounded-xl bg-warm-gradient grid place-items-center text-white">
                  <Globe className="size-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-display font-bold">Your group is going to {lockedDest.name}!</h2>
                  <p className="text-sm text-muted-foreground">The vote is final. Time to start packing! 🇮🇳✈️</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-teal-500 font-bold uppercase tracking-widest text-xs">
                 <CheckCircle2 size={16} /> Locked by Organizer
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary-soft text-primary grid place-items-center">
            <MapPin className="size-5" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl">Destination Board</h2>
            <p className="text-xs text-muted-foreground">{destinations.length} destinations suggested</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => setShowAIModal(true)}
            className="h-10 px-4 rounded-xl bg-secondary/50 border border-border text-xs font-bold flex items-center gap-2 hover:bg-secondary transition-all"
          >
            <Sparkles className="size-4 text-purple-400" /> Ask AI
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="h-10 px-4 rounded-xl bg-primary text-white text-xs font-bold flex items-center gap-2 shadow-cta hover:scale-105 transition-all"
          >
            <Plus className="size-4" /> Add yours
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {destinations.length === 0 ? (
          <div className="md:col-span-2 py-12 text-center border-2 border-dashed border-border rounded-3xl bg-secondary/5">
             <Globe className="size-12 text-muted-foreground mx-auto mb-4 opacity-20" />
             <p className="text-muted-foreground">No destinations suggested yet.</p>
             <p className="text-xs text-muted-foreground/60 mt-1 italic">Be the first to suggest a place!</p>
          </div>
        ) : (
          destinations.map((dest) => (
            <DestinationCard 
              key={dest.id} 
              dest={dest} 
              onVote={handleVote} 
              onLock={handleLock}
              onDelete={handleDelete}
              isOwner={isOwner}
              userId={user?.uid}
              isLockedAny={!!lockedDest}
            />
          ))
        )}
      </div>

      {showAIModal && (
        <AISuggestModal 
          tripId={tripId} 
          onClose={() => setShowAIModal(false)} 
          onSuccess={() => { loadData(); setShowAIModal(false); }}
        />
      )}

      {showAddModal && (
        <AddDestinationModal 
          tripId={tripId} 
          onClose={() => setShowAddModal(false)} 
          onSuccess={() => { loadData(); setShowAddModal(false); }}
        />
      )}
    </div>
  );
};

const DestinationCard = ({ dest, onVote, onLock, onDelete, isOwner, userId, isLockedAny }: any) => {
  const upvoted = dest.upvotes.includes(userId);
  const downvoted = dest.downvotes.includes(userId);
  const score = dest.upvotes.length - dest.downvotes.length;
  const totalVotes = dest.upvotes.length + dest.downvotes.length;
  const upRatio = totalVotes === 0 ? 0 : (dest.upvotes.length / totalVotes) * 100;

  return (
    <motion.div 
      layout
      className="group rounded-2xl bg-[#141416] border border-border overflow-hidden relative"
      style={{ border: dest.status === 'locked' ? `2px solid ${COLORS.teal}` : undefined }}
    >
      {/* Header Image */}
      <div className="h-40 relative overflow-hidden">
        <img 
          src={dest.imageUrl} 
          alt={dest.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        
        {/* Status Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          {dest.status === 'locked' && (
            <div style={{ backgroundColor: COLORS.teal }} className="px-3 py-1 rounded-lg text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
              <Lock size={12} /> Locked
            </div>
          )}
          {dest.status === 'leading' && !isLockedAny && (
            <div style={{ backgroundColor: COLORS.leadingBg, color: COLORS.leadingText }} className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg border border-teal-500/20">
              <Trophy size={12} /> Leading
            </div>
          )}
        </div>

        {dest.aiScore > 0 && (
          <div className="absolute top-4 right-4 bg-purple-500/20 backdrop-blur-md border border-purple-500/30 px-2 py-1 rounded-lg flex items-center gap-1.5">
            <Sparkles size={10} className="text-purple-400" />
            <span className="text-[10px] font-bold text-purple-300">AI {dest.aiScore}%</span>
          </div>
        )}

        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">📍</span>
            <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{dest.country}</span>
          </div>
          <h3 className="text-xl font-display font-bold text-white">{dest.name}</h3>
        </div>
      </div>

      <div className="p-5">
        <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
          {dest.description || "No description provided for this destination."}
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {dest.tags.map((tag: string, i: number) => (
            <span key={i} className="px-2 py-0.5 rounded-md bg-secondary text-[10px] font-bold text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>

        {/* Vote Bar */}
        <div className="flex items-center gap-4 mb-6">
          <button 
            disabled={dest.status === 'locked'}
            onClick={() => onVote(dest.id, 'up')}
            className={`size-10 rounded-xl border flex items-center justify-center transition-all ${
              upvoted ? 'bg-teal-500/10 border-teal-500 text-teal-500 shadow-teal-500/20 shadow-lg' : 'border-border text-muted-foreground hover:bg-secondary'
            }`}
          >
            <ThumbsUp size={18} />
          </button>
          
          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden relative">
            <div 
              className="absolute left-0 top-0 h-full bg-teal-500 transition-all duration-500" 
              style={{ width: `${upRatio}%` }}
            />
          </div>

          <button 
            disabled={dest.status === 'locked'}
            onClick={() => onVote(dest.id, 'down')}
            className={`size-10 rounded-xl border flex items-center justify-center transition-all ${
              downvoted ? 'bg-coral-500/10 border-[#993C1D] text-[#993C1D] shadow-coral-500/20 shadow-lg' : 'border-border text-muted-foreground hover:bg-secondary'
            }`}
          >
            <ThumbsDown size={18} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-full bg-warm-gradient grid place-items-center text-[10px] font-bold text-white uppercase">
              {dest.suggestedBy.name[0]}
            </div>
            <span className="text-[10px] font-bold text-muted-foreground">by {dest.suggestedBy.name}</span>
          </div>

          <div className="flex gap-2">
            {isOwner && dest.status !== 'locked' && (
              <button 
                onClick={() => onLock(dest.id)}
                className="h-8 px-3 rounded-lg border border-teal-500/30 text-teal-500 text-[10px] font-bold uppercase tracking-widest hover:bg-teal-500 hover:text-white transition-all"
              >
                Lock Choice
              </button>
            )}
            {(isOwner || dest.suggestedBy.userId === userId) && dest.status !== 'locked' && (
              <button 
                onClick={() => onDelete(dest.id)}
                className="size-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DestinationBoard;

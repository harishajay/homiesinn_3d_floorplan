import React, { useState } from 'react';
import { Roommate } from '../types/coliving';
import { Users, MessageSquare, Share2, Copy, Check, Send, X } from 'lucide-react';
import { INITIAL_CHAT_MESSAGES } from '../data/mockData';

interface RoommateCircleCardProps {
  roommates: Roommate[];
}

export const RoommateCircleCard: React.FC<RoommateCircleCardProps> = ({ roommates }) => {
  const [showChatModal, setShowChatModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [messages, setMessages] = useState(INITIAL_CHAT_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg = {
      id: `c-${Date.now()}`,
      sender: 'Harish Aravind (You)',
      text: newMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isWarden: false,
      isSelf: true,
    };

    setMessages([...messages, msg]);
    setNewMessage('');
  };

  const handleCopyInvite = () => {
    navigator.clipboard.writeText('https://homiesinn.com/invite/room-529-d?code=HARISH529');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Roommate Circle</h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">3 / 4 Residents</span>
          </div>

          {/* Roommates List */}
          <div className="space-y-2.5 mb-4">
            {roommates.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center ${r.avatarColor}`}
                  >
                    {r.initials}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{r.name}</h4>
                    <p className="text-[11px] text-slate-500">
                      {r.role} @ {r.company} • {r.bed}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowChatModal(true)}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-white transition-colors cursor-pointer"
                  title={`Chat with ${r.name}`}
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            ))}

            {/* Bed Pod D Open + Referral Incentive */}
            <div
              onClick={() => setShowInviteModal(true)}
              className="flex items-center justify-between p-2.5 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center">
                  +
                </div>
                <div>
                  <h4 className="text-xs font-bold text-indigo-900">Bed Pod D Open</h4>
                  <p className="text-[11px] text-indigo-700">Invite a colleague & earn ₹1,500</p>
                </div>
              </div>

              <div className="p-1.5 text-indigo-500 group-hover:text-indigo-700">
                <Share2 className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Group Chat CTA */}
        <button
          onClick={() => setShowChatModal(true)}
          className="w-full py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <MessageSquare className="w-4 h-4 text-indigo-600" />
          <span>Room 529 Group Chat</span>
        </button>
      </div>

      {/* Room 529 Group Chat Modal */}
      {showChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full h-[520px] flex flex-col shadow-xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                  529
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Room 529 Private Circle</h3>
                  <p className="text-[10px] text-slate-500">Praveen, Rohan, Harish, Warden Karthik</p>
                </div>
              </div>
              <button
                onClick={() => setShowChatModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.isSelf ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] text-slate-400 mb-0.5 px-1 font-medium">
                    {m.sender} • {m.time}
                  </span>
                  <div
                    className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-xs ${
                      m.isSelf
                        ? 'bg-indigo-600 text-white rounded-tr-xs'
                        : m.isWarden
                        ? 'bg-amber-100 text-amber-950 border border-amber-200/80 rounded-tl-xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs shadow-xs'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 bg-white flex gap-2">
              <input
                type="text"
                placeholder="Message Room 529..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-slate-50"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Invite Colleague Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Invite Roommate to Bed D</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-3">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Choose Your Roommate</h4>
              <p className="text-xs text-slate-500 mt-1">
                Share your invite link for Bed D. When your colleague reserves, you get ₹1,500 rent waiver credit and they get ₹500 off.
              </p>

              <div className="mt-4 p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <span className="font-mono text-slate-700 truncate mr-2">
                  homiesinn.com/r/529-D?ref=HARISH529
                </span>
                <button
                  onClick={handleCopyInvite}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

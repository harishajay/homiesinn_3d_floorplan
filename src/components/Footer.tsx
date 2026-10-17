import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-16 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-100">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center">
                H
              </div>
              <span className="text-base font-bold text-slate-900">HomiesInn</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Next-generation managed co-living and student accommodations across major metro hubs in India. Frictionless, secure, community-first.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Explore</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li><a href="#chennai" className="hover:text-slate-900 transition-colors">Available Hostels in Chennai</a></li>
              <li><a href="#omr" className="hover:text-slate-900 transition-colors">OMR Tech Corridor Suites</a></li>
              <li><a href="#guindy" className="hover:text-slate-900 transition-colors">Guindy Student Residences</a></li>
              <li><a href="#studios" className="hover:text-slate-900 transition-colors">Managed Private Studios</a></li>
            </ul>
          </div>

          {/* Resident Services */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Resident Services</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li><a href="#stays" className="hover:text-slate-900 transition-colors">Active Stays & Extensions</a></li>
              <li><a href="#housekeeping" className="hover:text-slate-900 transition-colors">Housekeeping Requests</a></li>
              <li><a href="#wifi" className="hover:text-slate-900 transition-colors">Wi-Fi & Network Helpdesk</a></li>
              <li><a href="#events" className="hover:text-slate-900 transition-colors">Events & Food Menu</a></li>
            </ul>
          </div>

          {/* City Central Desk */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">City Central Desk</h4>
            <div className="text-xs text-slate-500 space-y-1.5">
              <p>HomiesInn Central Cluster, T. Nagar, Chennai, Tamil Nadu 600017</p>
              <p className="text-slate-700 font-medium pt-1">Desk Hours: 08:00 AM – 10:00 PM IST</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>© 2025 HomiesInn Urban Living Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#rules" className="hover:text-slate-600 transition-colors">House Rules</a>
            <a href="#terms" className="hover:text-slate-600 transition-colors">Terms of Stay</a>
            <a href="#privacy" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

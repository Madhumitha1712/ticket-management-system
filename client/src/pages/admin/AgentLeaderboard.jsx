import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/index.js';
import { LoadingSpinner, EmptyState } from '../../components/common/EmptyState.jsx';
import {
  Trophy,
  Medal,
  Star,
  Search,
  UserCheck,
} from 'lucide-react';

export const AgentLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await analyticsService.getLeaderboard();
      setLeaderboard(data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load agent leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const filteredLeaderboard = leaderboard.filter(
    (agent) =>
      agent.name.toLowerCase().includes(search.toLowerCase()) ||
      agent.email.toLowerCase().includes(search.toLowerCase()) ||
      (agent.department && agent.department.toLowerCase().includes(search.toLowerCase()))
  );

  const topThree = filteredLeaderboard.slice(0, 3);

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1 text-amber-500">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3.5 h-3.5 ${
              star <= Math.round(rating)
                ? 'fill-amber-400 text-amber-500'
                : 'text-slate-200'
            }`}
          />
        ))}
        <span className="text-xs font-bold text-slate-700 ml-1">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            Support Agent Performance Leaderboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time rankings based on ticket resolution volume, SLA compliance, and customer satisfaction ratings
          </p>
        </div>
      </div>

      {/* Podium Cards for Top 3 */}
      {!loading && topThree.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {topThree.map((agent, index) => {
            const rankConfig = [
              {
                rank: '1st Place',
                bg: 'bg-gradient-to-b from-amber-50/80 via-white to-white border-amber-300 shadow-xs',
                medalColor: 'text-amber-500',
                badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
              },
              {
                rank: '2nd Place',
                bg: 'bg-gradient-to-b from-slate-100/70 via-white to-white border-slate-300 shadow-xs',
                medalColor: 'text-slate-500',
                badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
              },
              {
                rank: '3rd Place',
                bg: 'bg-gradient-to-b from-orange-50/60 via-white to-white border-orange-200 shadow-xs',
                medalColor: 'text-amber-700',
                badgeBg: 'bg-orange-100/70 text-orange-800 border-orange-200',
              },
            ][index];

            return (
              <div
                key={agent._id}
                className={`border rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between ${rankConfig.bg}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${rankConfig.badgeBg}`}>
                      {rankConfig.rank}
                    </span>
                    <Medal className={`w-6 h-6 ${rankConfig.medalColor}`} />
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-full bg-brand-50 text-brand-700 font-extrabold text-base flex items-center justify-center border-2 border-brand-200 shadow-xs">
                      {agent.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">
                        {agent.name}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        {agent.department || 'Support Operations'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 py-3 border-y border-slate-100 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Resolved Tickets:</span>
                      <span className="font-bold text-slate-900">{agent.resolved}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Resolution Rate:</span>
                      <span className="font-bold text-emerald-600">{agent.resolutionRate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Avg Satisfaction:</span>
                      <div>{renderStars(agent.avgRating)}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{agent.assigned} Assigned</span>
                  <span>{agent.totalReviews} Reviews</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search agents by name or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500/20 focus:border-brand-500 shadow-xs"
          />
        </div>
        <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
          {filteredLeaderboard.length} Agents Ranked
        </span>
      </div>

      {/* Full Leaderboard Table */}
      {loading ? (
        <LoadingSpinner text="Computing agent metrics..." />
      ) : filteredLeaderboard.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No Agent Records Found"
          description="Performance metrics will populate as support agents resolve tickets and collect feedback."
        />
      ) : (
        <div className="glass-panel border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="p-3.5 w-12 text-center">Rank</th>
                  <th className="p-3.5">Support Agent</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5 text-center">Total Assigned</th>
                  <th className="p-3.5 text-center">Resolved / Closed</th>
                  <th className="p-3.5 text-center">Resolution Rate</th>
                  <th className="p-3.5 text-center">SLA Breaches</th>
                  <th className="p-3.5 text-center">Avg Rating (Reviews)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeaderboard.map((agent, index) => (
                  <tr
                    key={agent._id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-[10px] ${
                          index === 0
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : index === 1
                            ? 'bg-slate-200 text-slate-800'
                            : index === 2
                            ? 'bg-amber-50 text-amber-900 border border-amber-200'
                            : 'text-slate-500'
                        }`}
                      >
                        #{index + 1}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-brand-50 border border-brand-200 text-brand-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {agent.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">
                            {agent.name}
                          </div>
                          <div className="text-[11px] text-slate-400">{agent.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-600 text-[11px]">
                      {agent.department || 'Support Desk'}
                    </td>
                    <td className="p-3.5 text-center font-semibold text-slate-800">
                      {agent.assigned}
                    </td>
                    <td className="p-3.5 text-center font-bold text-brand-700">
                      {agent.resolved}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="font-bold text-emerald-600">
                        {agent.resolutionRate}%
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`font-semibold ${
                          agent.breached > 0 ? 'text-red-600' : 'text-slate-400'
                        }`}
                      >
                        {agent.breached}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="inline-flex items-center justify-center">
                        {renderStars(agent.avgRating)}
                        <span className="text-[10px] text-slate-400 ml-1">
                          ({agent.totalReviews})
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentLeaderboard;

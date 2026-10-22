import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { slaService } from '../../services/index.js';
import { LoadingSpinner } from '../../components/common/EmptyState.jsx';
import {
  Clock,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  RefreshCw,
  Flame,
  Zap,
} from 'lucide-react';

const PRIORITY_BADGES = {
  CRITICAL: {
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: Flame,
  },
  HIGH: {
    bg: 'bg-orange-50 text-orange-700 border-orange-200',
    icon: AlertTriangle,
  },
  MEDIUM: {
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock,
  },
  LOW: {
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: CheckCircle2,
  },
};

export const SLAManagement = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triggeringCheck, setTriggeringCheck] = useState(false);
  const [checkResult, setCheckResult] = useState(null);
  const [editingRule, setEditingRule] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    responseTimeHours: 1,
    resolutionTimeHours: 4,
    escalateToAdmin: true,
  });

  const loadRules = async () => {
    setLoading(true);
    try {
      const data = await slaService.getRules();
      setRules(data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load SLA rules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleTriggerCheck = async () => {
    setTriggeringCheck(true);
    setCheckResult(null);
    try {
      const res = await slaService.triggerCheck();
      setCheckResult(res);
      setSuccess('SLA evaluation engine executed successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to trigger SLA scan');
    } finally {
      setTriggeringCheck(false);
    }
  };

  const openEditModal = (rule) => {
    setEditingRule(rule);
    setFormData({
      responseTimeHours: (rule.responseTimeMinutes / 60) || 1,
      resolutionTimeHours: (rule.resolutionTimeMinutes / 60) || 4,
      escalateToAdmin: rule.escalateToAdmin !== undefined ? rule.escalateToAdmin : true,
    });
    setError('');
    setSuccess('');
  };

  const handleUpdateRule = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        responseTimeMinutes: Math.round(Number(formData.responseTimeHours) * 60),
        resolutionTimeMinutes: Math.round(Number(formData.resolutionTimeHours) * 60),
        escalateToAdmin: Boolean(formData.escalateToAdmin),
      };
      await slaService.updateRule(editingRule._id, payload);
      setSuccess(`SLA Rule for ${editingRule.priority} updated successfully`);
      setEditingRule(null);
      loadRules();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update SLA rule');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-6 h-6 text-brand-600" />
            Service Level Agreements (SLA)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure response & resolution time targets, warning thresholds, and auto-escalation rules
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/escalations"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-all border border-slate-200 shadow-xs"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
            Escalations Queue
          </Link>
          <button
            onClick={handleTriggerCheck}
            disabled={triggeringCheck}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${triggeringCheck ? 'animate-spin' : ''}`} />
            Run SLA Scan
          </button>
        </div>
      </div>

      {/* SLA Engine Status Card */}
      <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-white rounded-2xl p-6 shadow-xs border border-blue-200/80 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-brand-800 border border-blue-200">
              <Zap className="w-3 h-3 text-amber-500" /> Automated SLA Background Engine Active
            </div>
            <h2 className="text-base font-bold text-slate-900">Continuous SLA Monitoring & Warning Trigger</h2>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              The SLA engine monitors active tickets against defined thresholds. When elapsed servicing time reaches 80% of deadline, an SLA warning is triggered. Breached tickets are automatically escalated.
            </p>
          </div>
          {checkResult && (
            <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-xs text-xs space-y-1 min-w-[220px]">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Scan Output:
              </div>
              <div className="text-slate-600">Checked: <span className="font-bold text-slate-900">{checkResult.inspected ?? checkResult.totalScanned ?? 0}</span></div>
              <div className="text-amber-700">Warnings Fired: <span className="font-bold text-slate-900">{checkResult.warned ?? checkResult.warnedCount ?? 0}</span></div>
              <div className="text-rose-700">Breached: <span className="font-bold text-slate-900">{checkResult.breached ?? checkResult.breachedCount ?? 0}</span></div>
            </div>
          )}
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-700 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* SLA Rules Table */}
      {loading ? (
        <LoadingSpinner text="Loading SLA configurations..." />
      ) : (
        <div className="glass-panel border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-xs">
              Configured SLA Matrix by Priority Tier
            </h3>
            <span className="text-[11px] text-slate-500">
              Auto-Calculated Deadlines on Ticket Ingestion
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="p-3.5">Priority Level</th>
                  <th className="p-3.5">Target Response Time</th>
                  <th className="p-3.5">Target Resolution Time</th>
                  <th className="p-3.5">80% Warning Point</th>
                  <th className="p-3.5">Escalation Policy</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rules.map((rule) => {
                  const badge = PRIORITY_BADGES[rule.priority] || PRIORITY_BADGES.MEDIUM;
                  const Icon = badge.icon;
                  const respHrs = (rule.responseTimeMinutes / 60).toFixed(1);
                  const resHrs = (rule.resolutionTimeMinutes / 60).toFixed(1);
                  const warnMins = Math.round(rule.resolutionTimeMinutes * 0.8);
                  const warnHrs = (warnMins / 60).toFixed(1);

                  return (
                    <tr key={rule._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}
                        >
                          <Icon className="w-3 h-3" />
                          {rule.priority}
                        </span>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-800">
                        {rule.responseTimeMinutes} mins ({respHrs}h)
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">
                        {rule.resolutionTimeMinutes} mins ({resHrs}h)
                      </td>
                      <td className="p-3.5 text-amber-700 font-semibold">
                        At {warnMins} mins ({warnHrs}h)
                      </td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-600">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Auto-Escalate to Admin on Breach
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => openEditModal(rule)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200/60 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          Edit SLA
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit SLA Modal */}
      {editingRule && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fadeIn">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                Edit SLA Targets: {editingRule.priority}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Adjust allowable response and resolution times in hours.
              </p>
            </div>

            <form onSubmit={handleUpdateRule} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Target Response Time (Hours) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={formData.responseTimeHours}
                  onChange={(e) => setFormData({ ...formData, responseTimeHours: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500/20 focus:border-brand-500 shadow-xs"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  = {Math.round(Number(formData.responseTimeHours) * 60)} minutes
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Target Resolution Time (Hours) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={formData.resolutionTimeHours}
                  onChange={(e) => setFormData({ ...formData, resolutionTimeHours: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500/20 focus:border-brand-500 shadow-xs"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  = {Math.round(Number(formData.resolutionTimeHours) * 60)} minutes (Warning at{' '}
                  {Math.round(Number(formData.resolutionTimeHours) * 60 * 0.8)} mins)
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="escalateToAdmin"
                  checked={formData.escalateToAdmin}
                  onChange={(e) => setFormData({ ...formData, escalateToAdmin: e.target.checked })}
                  className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                />
                <label htmlFor="escalateToAdmin" className="text-xs font-medium text-slate-700">
                  Auto-Escalate to Admin on Breach
                </label>
              </div>

              {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingRule(null)}
                  className="px-3.5 py-2 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs bg-brand-600 hover:bg-brand-700 text-white rounded-xl transition-colors font-bold shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Update Targets'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SLAManagement;

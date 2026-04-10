import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../../../components/ui/Button';
import { calendarService } from '../../../services/calendarService';
import { publicationIssueService } from '../../../services/publicationIssueService';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  LayoutGrid,
  List,
  Globe,
  BookOpen,
  Megaphone,
  AlertCircle,
  CalendarDays,
  X,
  Lock
} from 'lucide-react';
import { cn } from '../../../utils/cn';

const getUTCMidnight = (d) => {
  const date = new Date(d);
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

const getStartOfWeek = (date) => {
  const d = getUTCMidnight(date);
  const day = d.getUTCDay();
  d.setUTCDate(d.getUTCDate() - day);
  return d;
};

const getEndOfWeek = (date) => {
  const d = getUTCMidnight(date);
  const day = d.getUTCDay();
  d.setUTCDate(d.getUTCDate() + (6 - day));
  return d;
};

const getStartOfMonthGrid = (date) => {
  const d = getUTCMidnight(date);
  d.setUTCDate(1);
  return getStartOfWeek(d);
};

const getEndOfMonthGrid = (date) => {
  const d = getUTCMidnight(date);
  d.setUTCMonth(d.getUTCMonth() + 1, 0);
  return getEndOfWeek(d);
};

const formatDateToISO = (date) => date.toISOString().split('T')[0];

const formatLabelGr = (dateObj) => {
  const d = new Date(dateObj); // assume UTC for display
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[d.getUTCDay()]}, ${months[d.getUTCMonth()]} ${d.getUTCDate()}`;
};

const MOCK_TIME_HOURS = ['08:00 AM', '10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM'];

export const PublishingCalendar = () => {
  const [viewMode, setViewMode] = useState('weekly'); // 'monthly', 'weekly', 'daily'
  const [dateSystem, setDateSystem] = useState('gregorian'); // 'gregorian' or 'hebrew'
  const [currentDate, setCurrentDate] = useState(getUTCMidnight(new Date()));

  const [calendarData, setCalendarData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modal state
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  // Calculate start/end based on viewMode
  const { startDate, endDate } = useMemo(() => {
    let start, end;
    if (viewMode === 'monthly') {
      start = getStartOfMonthGrid(currentDate);
      end = getEndOfMonthGrid(currentDate);
    } else if (viewMode === 'weekly') {
      start = getStartOfWeek(currentDate);
      end = getEndOfWeek(currentDate);
    } else {
      start = getUTCMidnight(currentDate);
      end = getUTCMidnight(currentDate);
    }
    return { startDate: start, endDate: end };
  }, [viewMode, currentDate]);

  useEffect(() => {
    fetchCalendarData();
  }, [startDate, endDate]);

  const fetchCalendarData = async () => {
    setIsLoading(true);
    try {
      const res = await calendarService.getIssues(formatDateToISO(startDate), formatDateToISO(endDate));
      setCalendarData(res.data.data.calendar || []);
    } catch (error) {
      console.error('Failed to fetch calendar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigate = (direction) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'monthly') {
      newDate.setUTCMonth(newDate.getUTCMonth() + (direction === 'prev' ? -1 : 1));
    } else if (viewMode === 'weekly') {
      newDate.setUTCDate(newDate.getUTCDate() + (direction === 'prev' ? -7 : 7));
    } else {
      newDate.setUTCDate(newDate.getUTCDate() + (direction === 'prev' ? -1 : 1));
    }
    setCurrentDate(newDate);
  };

  const executeStatusAction = async (issueId, payload) => {
    try {
      await publicationIssueService.updateStatus(issueId, payload);
      setCalendarData(prev => prev.map(dayObj => ({
        ...dayObj,
        issues: dayObj.issues.map(iss => iss.id === issueId ? { ...iss, status: payload } : iss)
      })));
      if (selectedIssue?.id === issueId) {
        setSelectedIssue(prev => ({ ...prev, status: payload }));
      }
      setConfirmAction(null);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to perform action');
    }
  };

  const handleIssueAction = async (issueId, actionType, payload) => {
    if (actionType === 'status' && (payload === 'PRINTED' || payload === 'PUBLISHED')) {
      setConfirmAction({ issueId, payload });
      return;
    }

    try {
      if (actionType === 'status') {
        await publicationIssueService.updateStatus(issueId, payload);
      } else if (actionType === 'lock') {
        await publicationIssueService.toggleLock(issueId);
      }
      // Update local state instead of full refetch for snappiness
      setCalendarData(prev => prev.map(dayObj => ({
        ...dayObj,
        issues: dayObj.issues.map(iss => {
          if (iss.id === issueId) {
            if (actionType === 'status') return { ...iss, status: payload };
            if (actionType === 'lock') return { ...iss, isLocked: !iss.isLocked };
          }
          return iss;
        })
      })));
      if (selectedIssue && selectedIssue.id === issueId) {
        setSelectedIssue(prev => {
          if (actionType === 'status') return { ...prev, status: payload };
          if (actionType === 'lock') return { ...prev, isLocked: !prev.isLocked };
          return prev;
        });
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to perform action');
    }
  };

  // Extract days for viewing
  const gridDays = useMemo(() => {
    const days = [];
    let cur = new Date(startDate);
    const todayIso = formatDateToISO(new Date());

    while (cur <= endDate) {
      const iso = formatDateToISO(cur);
      const dataEntry = calendarData.find(d => d.date === iso) || { date: iso, hebrewDate: '', issues: [] };
      days.push({
        dateObj: new Date(cur),
        iso,
        grLabel: formatLabelGr(cur),
        heLabel: dataEntry.hebrewDate,
        isToday: iso === todayIso,
        issues: dataEntry.issues
      });
      cur.setUTCDate(cur.getUTCDate() + 1);
    }
    return days;
  }, [startDate, endDate, calendarData]);

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'READY': return <span className="bg-success text-white px-2 py-0.5 rounded text-[10px] font-bold">READY</span>;
      case 'IN_PROGRESS': return <span className="bg-warning text-white px-2 py-0.5 rounded text-[10px] font-bold">IN PROGRESS</span>;
      case 'PRINTED': return <span className="bg-info text-white px-2 py-0.5 rounded text-[10px] font-bold">PRINTED</span>;
      case 'PUBLISHED': return <span className="bg-indigo-600 text-white px-2 py-0.5 rounded text-[10px] font-bold">PUBLISHED</span>;
      case 'LOCKED': return <span className="bg-gray-800 text-white px-2 py-0.5 rounded text-[10px] font-bold">LOCKED</span>;
      case 'ARCHIVED': return <span className="bg-gray-400 text-white px-2 py-0.5 rounded text-[10px] font-bold">ARCHIVED</span>;
      case 'DEADLINE_PASSED': return <span className="bg-danger text-white px-2 py-0.5 rounded text-[10px] font-bold">OVERDUE</span>;
      case 'SCHEDULED': return <span className="bg-indigo/10 text-indigo px-2 py-0.5 rounded text-[10px] font-bold border border-indigo/20">SCHEDULED</span>;
      default: return <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-[10px] font-bold">{status || 'OPEN'}</span>;
    }
  };

  const getStatusColorClass = (status, deadlinePassed) => {
    if (deadlinePassed && status !== 'PRINTED' && status !== 'READY' && status !== 'PUBLISHED') return "border-danger bg-danger/5";
    switch (status) {
      case 'READY': return "border-success bg-success/5";
      case 'IN_PROGRESS': return "border-warning bg-warning/5";
      case 'PRINTED': return "border-info bg-info/5";
      case 'PUBLISHED': return "border-indigo-400 bg-indigo-50";
      case 'SCHEDULED': return "border-indigo/30 bg-indigo/5";
      default: return "border-gray-200 bg-white";
    }
  };

  const renderIssueCard = (issue) => (
    <div key={issue.id}
      onClick={() => setSelectedIssue(issue)}
      className={cn(
        "p-2.5 rounded-xl border mb-2 cursor-pointer transition-all hover:shadow-md relative overflow-hidden",
        getStatusColorClass(issue.status, issue.deadlinePassed)
      )}>
      {issue.isLocked && <div className="absolute top-2.5 right-2.5 text-gray-400"><Lock className="w-3 h-3" /></div>}
      <div className="flex items-start gap-1 justify-between mb-2 pr-4">
        <span className="font-bold text-xs truncate max-w-[120px] text-gray-900 leading-tight">
          {issue.title}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-1 mb-2">
        <div className="bg-white/80 rounded p-1 text-center border border-gray-100">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Ads</p>
          <p className="font-bold text-gray-900 leading-none">{issue.stats.total}</p>
        </div>
        <div className="bg-white/80 rounded p-1 text-center border border-gray-100">
          <p className="text-[10px] text-success uppercase tracking-widest font-semibold">Ready</p>
          <p className="font-bold text-success leading-none">{issue.stats.ready}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-1">
        {issue.deadlinePassed && issue.status !== 'PRINTED' && issue.status !== 'READY' ? (
          <span className="text-[10px] text-danger font-bold flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Missed Deadline
          </span>
        ) : (
          <span className="text-[10px] text-gray-500 font-medium">Pending: {issue.stats.pending}</span>
        )}
        {renderStatusBadge(issue.status)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10 flex flex-col h-[calc(100vh-8rem)]">
      {confirmAction && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 text-warning mb-4">
              <div className="p-3 bg-warning/10 rounded-full">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Irreversible Action</h3>
                <p className="text-sm font-semibold mt-0.5 text-warning">
                  Marking this issue as {confirmAction.payload}
                </p>
              </div>
            </div>

            <p className="text-gray-600 mb-6 leading-relaxed">
              {confirmAction.payload === 'PRINTED' ? (
                <>This will cascade the PRINTED status to all <strong>READY</strong> ads. Any ads that are not yet marked ready will instantly be placed into <strong>ARCHIVED</strong> and will miss this printed publication cut-off.</>
              ) : (
                <>This will lock the issue and mark all <strong>PRINTED</strong> ads as <strong>PUBLISHED</strong>. This indicates they are definitively out in the world.</>
              )}
              <br /><br />
              Are you sure you want to proceed?
            </p>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setConfirmAction(null)}>Cancel</Button>
              <Button
                variant="solid"
                className={confirmAction.payload === 'PRINTED' ? 'bg-indigo-600 hover:bg-red/90 text-white cursor-pointer' : 'bg-indigo-600 hover:bg-red-500 cursor-pointer text-white'}
                onClick={() => executeStatusAction(confirmAction.issueId, confirmAction.payload)}
              >
                Yes, Mark as {confirmAction.payload}
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Control Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <CalendarIcon className="w-7 h-7 text-accent" />
            Production Control Center
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage global publication issues and ad aggregations.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date System Toggle */}
          <div className="bg-gray-100 p-1 rounded-xl flex items-center border border-gray-200">
            <button
              onClick={() => setDateSystem('gregorian')}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                dateSystem === 'gregorian' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
              )}>
              <Globe className="w-3.5 h-3.5" /> Gregorian
            </button>
            <button
              onClick={() => setDateSystem('hebrew')}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                dateSystem === 'hebrew' ? "bg-white text-accent shadow-sm" : "text-gray-500 hover:text-gray-900"
              )}>
              <BookOpen className="w-3.5 h-3.5" /> Hebrew
            </button>
          </div>

          <div className="h-6 w-px bg-gray-200 mx-1 hidden md:block"></div>

          {/* View Mode Toggle */}
          <div className="bg-gray-100 p-1 rounded-xl flex items-center border border-gray-200">
            <button
              onClick={() => setViewMode('monthly')}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                viewMode === 'monthly' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
              )}>
              <CalendarDays className="w-3.5 h-3.5" /> Month
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                viewMode === 'weekly' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
              )}>
              <LayoutGrid className="w-3.5 h-3.5" /> Week
            </button>
            <button
              onClick={() => setViewMode('daily')}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                viewMode === 'daily' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
              )}>
              <List className="w-3.5 h-3.5" /> Day
            </button>
          </div>
        </div>
      </div>

      {/* Date Navigator Bar */}
      <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between shrink-0">
        <Button variant="outline" className="px-3 py-1.5 h-auto border-gray-200" onClick={() => handleNavigate('prev')}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Previous
        </Button>

        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-900">
            {dateSystem === 'gregorian'
              ? (viewMode === 'monthly'
                ? new Date(currentDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
                : `${formatLabelGr(startDate).split(',')[1]} - ${formatLabelGr(endDate).split(',')[1]}, ${endDate.getUTCFullYear()}`)
              : (gridDays[0] && gridDays[gridDays.length - 1] && `${gridDays[0].heLabel} - ${gridDays[gridDays.length - 1].heLabel}`)
            }
          </h2>
          <p className="text-xs text-gray-500 font-medium capitalize">{viewMode} View</p>
        </div>

        <Button variant="outline" className="px-3 py-1.5 h-auto border-gray-200" onClick={() => handleNavigate('next')}>
          Next <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* ---------------- MAIN CALENDAR VIEWS ---------------- */}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col min-h-0 relative isolate">

        {isLoading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-20 flex items-center justify-center">
            <div className="bg-white shadow-xl rounded-xl p-4 font-medium text-sm text-gray-600 border border-gray-100 flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-accent border-r-transparent animate-spin"></span>
              Loading Schedule...
            </div>
          </div>
        )}

        {(viewMode === 'weekly' || viewMode === 'monthly') && (
          <div className="flex-1 flex flex-col h-full overflow-hidden animate-in fade-in duration-300">
            {/* Column Headers */}
            <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 shrink-0">
              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, idx) => (
                <div key={idx} className="p-3 text-center border-r border-gray-200 last:border-r-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">{day}</p>
                </div>
              ))}
            </div>

            {/* Grid Content */}
            <div className="flex-1 overflow-y-auto w-full relative">
              <div className={`grid grid-cols-7 border-l border-t border-gray-100 min-h-full ${viewMode === 'monthly' ? 'grid-rows-[repeat(auto-fill,minmax(150px,1fr))]' : 'grid-rows-1'}`}>
                {gridDays.map((day, idx) => (
                  <div key={idx} className={cn(
                    "p-2 border-r border-b border-gray-100 relative min-h-[150px]",
                    day.isToday ? "bg-accent/5 ring-1 ring-inset ring-accent/20" :
                      (day.dateObj.getUTCMonth() !== currentDate.getUTCMonth() && viewMode === 'monthly') ? "bg-gray-50/50 opacity-60" : "bg-white"
                  )}>
                    <div className="flex justify-between items-baseline mb-2 pb-2 border-b border-gray-100/50">
                      <span className={cn("text-xs font-bold", day.isToday ? "text-accent" : "text-gray-900")}>
                        {day.grLabel.split(',')[1]}
                      </span>
                      <span className="text-[10px] font-medium text-gray-400">
                        {day.heLabel.split(' ').slice(0, 2).join(' ')}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {day.issues.map(renderIssueCard)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'daily' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden animate-in fade-in duration-300">
            {/* Daily Header */}
            <div className="border-b border-gray-200 bg-gray-50 p-4 shrink-0 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Agenda</h3>
                <p className="text-sm text-gray-500">
                  {dateSystem === 'gregorian' ? formatLabelGr(currentDate) : (gridDays[0] ? gridDays[0].heLabel : '')}
                </p>
              </div>
            </div>

            {/* Daily Timeline */}
            <div className="flex-1 overflow-y-auto p-6 max-w-4xl w-full mx-auto relative">
              {/* Vertical timeline line */}
              <div className="absolute left-[88px] top-6 bottom-6 w-px bg-gray-200"></div>

              {gridDays[0]?.issues.map((issue, idx) => (
                <div key={issue.id} className="flex gap-6 mb-8 relative group" onClick={() => setSelectedIssue(issue)}>
                  <div className="w-16 shrink-0 text-right py-3">
                    <span className="text-sm font-bold text-gray-500">{MOCK_TIME_HOURS[idx % MOCK_TIME_HOURS.length]}</span>
                  </div>

                  {/* Timeline dot */}
                  <div className="absolute left-[84px] top-4 w-2.5 h-2.5 rounded-full border-2 border-white bg-gray-400 group-hover:scale-125 group-hover:bg-accent transition-all"></div>

                  <div className={cn("flex-1 border rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all", getStatusColorClass(issue.status, issue.deadlinePassed))}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {renderStatusBadge(issue.status)}
                          {issue.isLocked && <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1"><Lock className="w-3 h-3" /> LOCKED</span>}
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 mt-2">{issue.title}</h4>
                        <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                          <BookOpen className="w-4 h-4" /> {issue.publishingType}
                        </p>
                        <div className="mt-4 flex items-center gap-6 text-sm">
                          <div><span className="text-gray-400">Total Ads:</span> <span className="font-bold text-gray-900">{issue.stats.total}</span></div>
                          <div><span className="text-gray-400">Ready:</span> <span className="font-bold text-success">{issue.stats.ready}</span></div>
                          <div><span className="text-gray-400">Pending:</span> <span className="font-bold text-warning">{issue.stats.pending}</span></div>
                          <div><span className="text-gray-400">In Design:</span> <span className="font-bold text-indigo">{issue.stats.inDesign}</span></div>
                        </div>
                      </div>
                      <Button variant="outline" className="text-xs h-8 py-0">View Details</Button>
                    </div>
                  </div>
                </div>
              ))}

              {!isLoading && (!gridDays[0]?.issues || gridDays[0].issues.length === 0) && (
                <div className="text-center py-20 text-gray-400 font-medium">No publications scheduled for this day.</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Slide-out Overlay Modal for Issue Details */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm" onClick={() => setSelectedIssue(null)}></div>
          <div className="w-full max-w-sm bg-white h-full shadow-2xl relative z-10 animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-bold text-lg text-gray-900">Issue Details</h3>
              <button onClick={() => setSelectedIssue(null)} className="p-2 -mr-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              <div>
                <div className="mb-2">
                  {renderStatusBadge(selectedIssue.status)}
                  {selectedIssue.isLocked && <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1"><Lock className="w-3 h-3" /> LOCKED</span>}
                </div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-tight">{selectedIssue.title}</h2>
                <p className="text-gray-500 font-medium mt-1">{selectedIssue.publishingType}</p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Target Deadline</p>
                <p className="font-medium text-gray-900">{new Date(selectedIssue.deadline).toLocaleString()}</p>
                {selectedIssue.deadlinePassed && selectedIssue.status !== 'PRINTED' && (
                  <p className="text-xs text-danger font-bold mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> Passed target deadline
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Ad Volumes</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="border border-gray-100 rounded-xl p-3 bg-white">
                    <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Total Ads</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{selectedIssue.stats.total}</p>
                  </div>
                  <div className="border border-success/20 rounded-xl p-3 bg-success/5">
                    <p className="text-[10px] font-bold uppercase text-success tracking-wider">Ready to Print</p>
                    <p className="text-2xl font-bold text-success mt-1">{selectedIssue.stats.ready}</p>
                  </div>
                  <div className="border border-warning/20 rounded-xl p-3 bg-warning/5">
                    <p className="text-[10px] font-bold uppercase text-warning tracking-wider">In Review</p>
                    <p className="text-2xl font-bold text-warning mt-1">{selectedIssue.stats.pending}</p>
                  </div>
                  <div className="border border-indigo/20 rounded-xl p-3 bg-indigo/5">
                    <p className="text-[10px] font-bold uppercase text-indigo tracking-wider">In Design</p>
                    <p className="text-2xl font-bold text-indigo mt-1">{selectedIssue.stats.inDesign}</p>
                  </div>
                  <div className="border border-gray-200 rounded-xl p-3 bg-gray-300/5">
                    <p className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Printed</p>
                    <p className="text-2xl font-bold text-gray-500 mt-1">{selectedIssue.stats.printed}</p>
                  </div>
                  <div className="border border-indigo/50 rounded-xl p-3 bg-indigo/5">
                    <p className="text-[10px] font-bold uppercase text-indigo tracking-wider">Published</p>
                    <p className="text-2xl font-bold text-indigo mt-1">{selectedIssue.stats.published}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-col gap-3">
              <Button
                variant={selectedIssue.isLocked ? "outline" : "solid"}
                onClick={() => handleIssueAction(selectedIssue.id, 'lock')}
                className={cn("w-full flex justify-center gap-2 text-white shadow-sm", selectedIssue.isLocked ? "text-gray-700 bg-white" : "bg-gray-800 hover:bg-gray-900")}
              >
                <Lock className="w-4 h-4" /> {selectedIssue.isLocked ? "Unlock Issue" : "Lock Production"}
              </Button>

              <div className="grid grid-cols-2 gap-3">
                {/* Allow setting to OPEN from SCHEDULED (forward) and READY (backward undo before printing) */}
                {['SCHEDULED', 'READY'].includes(selectedIssue.status) && (
                  <Button variant="outline" className="w-full text-gray-600 hover:bg-gray-100" onClick={() => handleIssueAction(selectedIssue.id, 'status', 'OPEN')}>
                    {selectedIssue.status === 'READY' ? 'Revert to Open' : 'Open Issue'}
                  </Button>
                )}

                {/* Allow moving to READY only from OPEN */}
                {selectedIssue.status === 'OPEN' && (
                  <Button variant="outline" className="w-full text-success hover:bg-success/5 border-success/30 col-span-2" onClick={() => handleIssueAction(selectedIssue.id, 'status', 'READY')}>
                    Mark Ready to Print
                  </Button>
                )}

                {/* Allow moving to PRINTED only from READY */}
                {selectedIssue.status === 'READY' && (
                  <Button variant="outline" className="w-full text-info hover:bg-info/5 border-info/30" onClick={() => handleIssueAction(selectedIssue.id, 'status', 'PRINTED')}>
                    Mark Printed
                  </Button>
                )}
              </div>

              {/* Publish — cascades AdStatus=PUBLISHED. Allowable only from PRINTED. */}
              {selectedIssue.status === 'PRINTED' && (
                <Button
                  className="w-full flex justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                  onClick={() => handleIssueAction(selectedIssue.id, 'status', 'PUBLISHED')}
                >
                  <Globe className="w-4 h-4" /> Mark Published
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

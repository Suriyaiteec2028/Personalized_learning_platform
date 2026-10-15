import React, { useState, useEffect, useRef } from 'react';
import API from '../services/api';
import {
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle,
  Award,
  Code,
  Check,
  ChevronLeft,
  ChevronRight,
  Play,
  XCircle,
  Terminal,
  Save,
  ListChecks,
  PieChart,
  Maximize2,
  Lock,
  Ban
} from 'lucide-react';

const MAX_STRIKES = 5;

export default function SecureTestModal({ testData, onClose, onTestCompleted }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [studentAnswers, setStudentAnswers] = useState({});
  const [malpracticeCount, setMalpracticeCount] = useState(0);
  const [malpracticeLogs, setMalpracticeLogs] = useState([]);
  const [warningBanner, setWarningBanner] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);

  const [startTime] = useState(new Date());
  const [timeLeftSeconds, setTimeLeftSeconds] = useState((testData.durationMinutes || 30) * 60);
  const [submitting, setSubmitting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Run Code states
  const [runningCode, setRunningCode] = useState(false);
  const [runResults, setRunResults] = useState({}); // map of questionId -> result
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState(null);

  // Result view active tab: 'questions' | 'overview'
  const [resultTab, setResultTab] = useState('questions');

  // Cooldown tracker to prevent duplicate strikes within 1.2s
  const lastViolationTimeRef = useRef(0);
  const modalContainerRef = useRef(null);

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. FULLSCREEN MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────
  const requestFullScreen = () => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(() => {});
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
    } catch (_) {}
  };

  useEffect(() => {
    requestFullScreen();
    const handleFullscreenChange = () => {
      const isFull = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(isFull);
      if (!isFull && !testResult && !isBlocked) {
        triggerMalpracticeStrike('Exited Fullscreen Mode! Fullscreen is required.');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, [testResult, isBlocked]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. MALPRACTICE STRIKE ENGINE (5 STRIKES MAX)
  // ─────────────────────────────────────────────────────────────────────────────
  const triggerMalpracticeStrike = (reason) => {
    if (isBlocked || testResult) return;

    const now = Date.now();
    // Debounce duplicate events within 1.2 seconds
    if (now - lastViolationTimeRef.current < 1200) return;
    lastViolationTimeRef.current = now;

    setMalpracticeCount((prev) => {
      const newCount = prev + 1;
      const logEntry = {
        strike: newCount,
        reason,
        time: new Date().toLocaleTimeString()
      };
      setMalpracticeLogs((logs) => [...logs, logEntry]);

      if (newCount >= MAX_STRIKES) {
        // AUTOMATIC TERMINATION & LOCKOUT
        setIsBlocked(true);
        setWarningBanner(`🚨 MALPRACTICE LIMIT EXCEEDED (5/5 Strikes). Test is permanently locked and submitted.`);
        handleFinalSubmit(true, `Test terminated: Exceeded maximum 5 anti-cheat malpractice strikes. Last violation: ${reason}`);
      } else {
        const remaining = MAX_STRIKES - newCount;
        setWarningBanner(
          `⚠️ MALPRACTICE STRIKE ${newCount} of ${MAX_STRIKES}: ${reason}. (${remaining} strike${remaining > 1 ? 's' : ''} remaining before automatic termination!)`
        );
        setTimeout(() => setWarningBanner(''), 6000);
      }

      return newCount;
    });
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. KEYBOARD, SHORTCUT & FUNCTION KEY RESTRICTIONS
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isBlocked || testResult) return;

      const key = e.key;
      const code = e.code || '';
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      // 1. BLOCK ALL FUNCTION KEYS (F1 - F12)
      if (
        key.startsWith('F') && !isNaN(parseInt(key.substring(1))) ||
        ['F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12'].includes(key) ||
        code.startsWith('F') && !isNaN(parseInt(code.substring(1)))
      ) {
        e.preventDefault();
        e.stopPropagation();
        triggerMalpracticeStrike(`Function Key [${key || code}] pressed! Function keys are prohibited.`);
        return false;
      }

      // 2. BLOCK COPY, PASTE, CUT SHORTCUTS (Ctrl+C, Ctrl+V, Ctrl+X)
      if (isCtrlOrMeta && ['c', 'v', 'x'].includes(key.toLowerCase())) {
        e.preventDefault();
        e.stopPropagation();
        triggerMalpracticeStrike(`Clipboard shortcut [Ctrl+${key.toUpperCase()}] is prohibited!`);
        return false;
      }

      // 3. BLOCK DEVTOOLS, PRINT, VIEW SOURCE, SELECT ALL (Ctrl+Shift+I/J/C, Ctrl+U, Ctrl+P, Ctrl+S)
      if (
        (isCtrlOrMeta && ['u', 'p', 's'].includes(key.toLowerCase())) ||
        (isCtrlOrMeta && e.shiftKey && ['i', 'j', 'c'].includes(key.toLowerCase()))
      ) {
        e.preventDefault();
        e.stopPropagation();
        triggerMalpracticeStrike(`Developer/System shortcut [Ctrl+${key.toUpperCase()}] is prohibited!`);
        return false;
      }

      // 4. BLOCK ALT+TAB / WINDOWS META
      if ((e.altKey && key === 'Tab') || key === 'Meta') {
        e.preventDefault();
        e.stopPropagation();
        triggerMalpracticeStrike('Application navigation shortcut (Alt+Tab / Windows Key) detected!');
        return false;
      }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // 4. CLIPBOARD & RIGHT-CLICK (CONTEXT MENU) BLOCKING
    // ─────────────────────────────────────────────────────────────────────────
    const handleCopy = (e) => {
      e.preventDefault();
      triggerMalpracticeStrike('Copy action attempted!');
    };

    const handlePaste = (e) => {
      e.preventDefault();
      triggerMalpracticeStrike('Paste action attempted!');
    };

    const handleCut = (e) => {
      e.preventDefault();
      triggerMalpracticeStrike('Cut action attempted!');
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      triggerMalpracticeStrike('Right-click context menu is prohibited!');
    };

    // ─────────────────────────────────────────────────────────────────────────
    // 5. TAB SWITCH & WINDOW FOCUS LOSS (BLUR)
    // ─────────────────────────────────────────────────────────────────────────
    const handleVisibilityChange = () => {
      if (document.hidden && !isBlocked && !testResult) {
        triggerMalpracticeStrike('Navigated away or switched browser tab!');
      }
    };

    const handleWindowBlur = () => {
      if (!isBlocked && !testResult) {
        triggerMalpracticeStrike('Window focus lost! Navigating away from test is prohibited.');
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('copy', handleCopy, true);
    window.addEventListener('paste', handlePaste, true);
    window.addEventListener('cut', handleCut, true);
    window.addEventListener('contextmenu', handleContextMenu, true);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('copy', handleCopy, true);
      window.removeEventListener('paste', handlePaste, true);
      window.removeEventListener('cut', handleCut, true);
      window.removeEventListener('contextmenu', handleContextMenu, true);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [isBlocked, testResult]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. TIMER COUNTDOWN
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (testResult || isBlocked) return;
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit(false, 'Time expired.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [testResult, isBlocked]);

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // Auto-save handler: updates state immediately on typing
  const handleAnswerSelect = (qId, val) => {
    if (isBlocked) return;
    setStudentAnswers((prev) => ({ ...prev, [qId]: val }));
    setLastAutoSaveTime(new Date());
  };

  // Run Code feature for programming questions
  const handleRunCode = async (questionId) => {
    if (isBlocked) return;
    const currentCode =
      studentAnswers[questionId] !== undefined
        ? studentAnswers[questionId]
        : testData.questions[currentIdx]?.sampleCode || '';

    setRunningCode(true);
    try {
      const res = await API.post('/tests/run-code', {
        questionId,
        code: currentCode
      });
      setRunResults((prev) => ({ ...prev, [questionId]: res.data }));
    } catch (err) {
      alert('Error running code: ' + (err.response?.data?.message || err.message));
    } finally {
      setRunningCode(false);
    }
  };

  // Final Submit
  const handleFinalSubmit = async (isTerminated = false, terminationReason = '') => {
    if (submitting || testResult) return;
    setSubmitting(true);
    const endTime = new Date();

    const formattedAnswers = testData.questions.map((q) => {
      const rawAns =
        studentAnswers[q._id] !== undefined
          ? studentAnswers[q._id]
          : q.type === 'programming'
          ? q.sampleCode || ''
          : '';

      return {
        questionId: q._id,
        studentAnswer: rawAns
      };
    });

    try {
      const payload = {
        courseId: testData.questions[0]?.courseId,
        isReattempt: !!testData.isReattempt,
        weakTopic: testData.topicTitle || '',
        startTime,
        endTime,
        tabSwitchCount: malpracticeCount,
        malpracticeCount,
        isTerminatedForMalpractice: isTerminated,
        malpracticeReason: terminationReason,
        answers: formattedAnswers
      };

      const res = await API.post('/tests/submit', payload);
      setTestResult(res.data);
      if (onTestCompleted) onTestCompleted(res.data);
    } catch (err) {
      console.error('Submission error:', err);
      alert('Error submitting test: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const currentQ = testData.questions[currentIdx];

  // ═══════════════════════════════════════════════════════════════════════════
  // RESULT SUMMARY SCREEN (POST-SUBMIT OR MALPRACTICE TERMINATION)
  // ═══════════════════════════════════════════════════════════════════════════
  if (testResult) {
    const questionsList = testResult.questionResults || [];
    const wasBlocked = testResult.isTerminatedForMalpractice || isBlocked;

    return (
      <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-lg flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl text-slate-100 max-h-[92vh] flex flex-col">
          {/* Header */}
          <div className="text-center mb-5 flex-shrink-0">
            {wasBlocked ? (
              <div className="inline-flex p-3 bg-rose-500/20 text-rose-400 rounded-full mb-2 border border-rose-500/30 animate-bounce">
                <Ban className="h-10 w-10" />
              </div>
            ) : (
              <div className="inline-flex p-3 bg-emerald-500/20 text-emerald-400 rounded-full mb-2 border border-emerald-500/30">
                <Award className="h-10 w-10" />
              </div>
            )}

            <h2 className={`text-2xl font-black ${wasBlocked ? 'text-rose-400' : 'text-white'}`}>
              {wasBlocked ? 'Test Blocked & Terminated Due to Malpractice' : 'Test Completed & Evaluated!'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">{testResult.testTitle}</p>
          </div>

          {/* Malpractice Callout Box if Blocked */}
          {wasBlocked && (
            <div className="bg-rose-950/60 border border-rose-500/40 p-4 rounded-2xl mb-4 text-xs text-rose-200 flex-shrink-0">
              <div className="flex items-center space-x-2 font-bold text-rose-300 mb-1">
                <AlertTriangle className="h-4 w-4" />
                <span>ANTI-CHEAT SYSTEM VIOLATION ENFORCEMENT</span>
              </div>
              <p className="leading-relaxed">
                You exceeded the maximum allowed limit of <strong>5 anti-cheat violations</strong> (tab-switching, exiting fullscreen, or prohibited shortcut/function keys). Your test was automatically locked and submitted. All answers submitted prior to termination have been evaluated, and violation logs have been reported to your teacher.
              </p>
            </div>
          )}

          {/* Quick Score Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 text-center flex-shrink-0">
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block uppercase font-bold">Total Score</span>
              <span className="text-2xl font-black text-blue-400">
                {testResult.totalMarks} / {testResult.maxPossibleMarks}
              </span>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block uppercase font-bold">Percentage</span>
              <span
                className={`text-2xl font-black ${
                  testResult.scorePercentage >= 75 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {testResult.scorePercentage}%
              </span>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block uppercase font-bold">MCQ Marks</span>
              <span className="text-xl font-bold text-slate-200">{testResult.mcqMarks} pts</span>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block uppercase font-bold">Coding Marks</span>
              <span className="text-xl font-bold text-amber-300">
                {testResult.programmingMarks} pts
              </span>
            </div>
          </div>

          {/* Timing & Security Bar */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs flex flex-wrap justify-between items-center gap-2 mb-4 flex-shrink-0">
            <div className="flex gap-4 text-slate-400">
              <span>
                Start:{' '}
                <strong className="text-white">
                  {new Date(testResult.startTime).toLocaleTimeString()}
                </strong>
              </span>
              <span>
                End:{' '}
                <strong className="text-white">
                  {new Date(testResult.endTime).toLocaleTimeString()}
                </strong>
              </span>
            </div>
            <div className="text-slate-400">
              <span>Anti-Cheat Strikes:{' '}</span>
              <strong
                className={
                  (testResult.malpracticeCount || testResult.tabSwitchCount) >= MAX_STRIKES
                    ? 'text-rose-400 font-black'
                    : (testResult.malpracticeCount || testResult.tabSwitchCount) > 0
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }
              >
                {testResult.malpracticeCount || testResult.tabSwitchCount} / {MAX_STRIKES} Strikes
              </strong>
            </div>
          </div>

          {/* Result Tabs Navigation */}
          <div className="flex border-b border-slate-800 mb-4 space-x-4 flex-shrink-0">
            <button
              onClick={() => setResultTab('questions')}
              className={`pb-2.5 px-2 font-bold text-xs flex items-center space-x-1.5 border-b-2 transition-all ${
                resultTab === 'questions'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <ListChecks className="h-4 w-4" />
              <span>Question Marks Breakdown ({questionsList.length})</span>
            </button>
            <button
              onClick={() => setResultTab('overview')}
              className={`pb-2.5 px-2 font-bold text-xs flex items-center space-x-1.5 border-b-2 transition-all ${
                resultTab === 'overview'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <PieChart className="h-4 w-4" />
              <span>Topic Skill Analysis</span>
            </button>
          </div>

          {/* TAB CONTENT (Scrollable) */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-3 mb-4">
            {resultTab === 'questions' ? (
              <div className="space-y-3">
                {questionsList.map((q, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition-all ${
                      q.isCorrect
                        ? 'bg-slate-950/90 border-emerald-500/30'
                        : 'bg-slate-950/90 border-rose-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-xs bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                          Q{q.questionNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                            q.type === 'mcq'
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          {q.type === 'mcq' ? 'MCQ' : 'Programming'}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate max-w-xs">
                          {q.topicTitle}
                        </span>
                      </div>

                      {/* Marks Score Display */}
                      <div className="flex items-center space-x-2">
                        <span
                          className={`font-mono text-xs font-black px-2.5 py-1 rounded-lg border ${
                            q.isCorrect
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          {q.marksEarned} / {q.maxMarks} {q.maxMarks === 1 ? 'Mark' : 'Marks'}
                        </span>
                        {q.isCorrect ? (
                          <span className="bg-emerald-500/20 text-emerald-400 p-1 rounded-full">
                            <Check className="h-3.5 w-3.5" />
                          </span>
                        ) : (
                          <span className="bg-rose-500/20 text-rose-400 p-1 rounded-full">
                            <XCircle className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-200 mb-2 font-medium leading-relaxed">
                      {q.questionText}
                    </p>

                    {/* MCQ Details */}
                    {q.type === 'mcq' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                        <div>
                          <span className="text-slate-400">Your Answer: </span>
                          <strong
                            className={q.isCorrect ? 'text-emerald-300' : 'text-rose-300'}
                          >
                            {q.selectedOption || '(Not Answered)'}
                          </strong>
                        </div>
                        {!q.isCorrect && (
                          <div>
                            <span className="text-slate-400">Correct Answer: </span>
                            <strong className="text-emerald-300">{q.correctOption}</strong>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Programming Details */}
                    {q.type === 'programming' && (
                      <div className="space-y-2 mt-2">
                        <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                          <span className="text-slate-400 block mb-0.5">Evaluation Feedback:</span>
                          <p
                            className={
                              q.isCorrect ? 'text-emerald-300 font-semibold' : 'text-amber-300'
                            }
                          >
                            {q.feedback}
                          </p>
                        </div>

                        {q.testCaseResults && q.testCaseResults.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {q.testCaseResults.map((tc, tcIdx) => (
                              <div
                                key={tcIdx}
                                className={`p-2 rounded-xl text-[10px] font-mono border flex items-center justify-between ${
                                  tc.passed
                                    ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                                    : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
                                }`}
                              >
                                <span>Test Case #{tc.caseNumber}</span>
                                <span className="font-bold">
                                  {tc.passed ? 'PASSED ✓' : 'FAILED ✗'}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2.5">
                {testResult.topicPerformance.map((tp, i) => (
                  <div
                    key={i}
                    className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs"
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-bold text-slate-200 text-sm">{tp.topicTitle}</span>
                      <span
                        className={`font-mono font-bold text-xs px-2.5 py-1 rounded-lg border ${
                          tp.skillPercentage >= 75
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {tp.skillPercentage}% Skill
                      </span>
                    </div>
                    <p className="text-slate-400 leading-relaxed">{tp.reason}</p>
                    <div className="flex gap-4 mt-2 text-[11px] text-slate-500 font-medium">
                      <span>MCQs Correct: {tp.mcqCorrect} / {tp.mcqTotal}</span>
                      <span>Coding Solved: {tp.progCorrect} / {tp.progTotal}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Close Action Button */}
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg transition-all text-xs flex-shrink-0"
          >
            Close Summary & View Personalized Recommendations
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIVE TEST WINDOW (STRICT FULLSCREEN & ANTI-CHEAT ENFORCEMENT)
  // ═══════════════════════════════════════════════════════════════════════════
  const currentRunResult = runResults[currentQ?._id];

  return (
    <div
      ref={modalContainerRef}
      onCopy={(e) => { e.preventDefault(); triggerMalpracticeStrike('Copy action prohibited!'); }}
      onPaste={(e) => { e.preventDefault(); triggerMalpracticeStrike('Paste action prohibited!'); }}
      onCut={(e) => { e.preventDefault(); triggerMalpracticeStrike('Cut action prohibited!'); }}
      onContextMenu={(e) => { e.preventDefault(); triggerMalpracticeStrike('Right click context menu is disabled!'); }}
      className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col overflow-hidden select-none"
    >
      {/* FULLSCREEN RE-ENTRY OVERLAY IF EXITED */}
      {!isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
          <div className="p-4 bg-rose-500/20 text-rose-400 rounded-full mb-4 border border-rose-500/40 animate-pulse">
            <Maximize2 className="h-12 w-12" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">FULLSCREEN MODE REQUIRED</h2>
          <p className="text-sm text-slate-300 max-w-md mb-6 leading-relaxed">
            Exiting fullscreen is recorded as a malpractice strike. You must remain in fullscreen mode throughout the examination.
          </p>
          <button
            onClick={requestFullScreen}
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-xl transition-all flex items-center space-x-2 text-sm"
          >
            <Maximize2 className="h-4 w-4" />
            <span>Return to Fullscreen & Resume Test</span>
          </button>
        </div>
      )}

      {/* Top Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <div className="p-1.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg">
            <Shield className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">{testData.courseTitle || 'Course Test'}</h3>
            <span className="text-xs text-slate-400">
              Strict Anti-Cheat Assessment Mode | Total Questions: {testData.totalQuestions}
            </span>
          </div>
        </div>

        {/* Live Malpractice Strikes Counter (Max 5) */}
        <div className="flex items-center space-x-3">
          <div
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
              malpracticeCount >= 4
                ? 'bg-rose-600/30 border-rose-500 text-rose-300 animate-pulse'
                : malpracticeCount > 0
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>
              Malpractice Strikes:{' '}
              <strong className="font-mono text-sm">
                {malpracticeCount} / {MAX_STRIKES}
              </strong>
            </span>
          </div>

          {/* Countdown Timer */}
          <div className="flex items-center space-x-2 bg-slate-950 px-4 py-1.5 rounded-xl border border-slate-800">
            <Clock className="h-4 w-4 text-amber-400" />
            <span className="font-mono text-sm font-bold text-amber-300 tracking-wider">
              {formatTime(timeLeftSeconds)}
            </span>
          </div>
        </div>
      </div>

      {/* Security Toast Warning Banner */}
      {warningBanner && (
        <div className="bg-rose-600 text-white text-xs font-bold px-6 py-2.5 flex items-center justify-center space-x-2 shadow-lg animate-pulse">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span className="text-center">{warningBanner}</span>
        </div>
      )}

      {/* Main Workspace Split Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Sidebar Question Palette */}
        <div className="w-full md:w-64 bg-slate-900/60 border-r border-slate-800 p-4 flex flex-col">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Questions
          </h4>
          <div className="grid grid-cols-5 md:grid-cols-4 gap-2 overflow-y-auto max-h-48 md:max-h-full">
            {testData.questions.map((q, idx) => {
              const answered =
                studentAnswers[q._id] !== undefined && studentAnswers[q._id] !== '';
              const isCurrent = idx === currentIdx;
              return (
                <button
                  key={q._id}
                  onClick={() => setCurrentIdx(idx)}
                  className={`h-10 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                    isCurrent
                      ? 'ring-2 ring-blue-500 bg-blue-600 text-white'
                      : answered
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="mt-auto pt-4 border-t border-slate-800 text-xs text-slate-400 space-y-1.5">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500/50" />
              <span>Answered</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded bg-slate-950 border border-slate-800" />
              <span>Unanswered</span>
            </div>
            <div className="pt-2 text-[10px] text-rose-400 font-semibold border-t border-slate-800/80">
              🔒 Anti-Cheat Enabled: Tab switch, Copy-Paste & F-keys blocked. (Max 5 strikes).
            </div>
          </div>
        </div>

        {/* Center / Right Content Panel */}
        <div className="flex-1 p-6 flex flex-col overflow-y-auto bg-slate-950">
          {/* Question Metadata Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="bg-blue-600/20 text-blue-400 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/30">
                Q {currentIdx + 1} of {testData.questions.length}
              </span>
              <span className="bg-slate-900 text-slate-300 text-xs px-3 py-1 rounded-full border border-slate-800">
                {currentQ.topicTitle}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              {/* Auto-saved badge */}
              <span className="text-[11px] text-slate-500 flex items-center space-x-1">
                <Save className="h-3.5 w-3.5 text-emerald-500" />
                <span>Auto-saved</span>
              </span>

              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                  currentQ.type === 'mcq'
                    ? 'text-blue-400 bg-blue-500/10 border-blue-500/20'
                    : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                }`}
              >
                {currentQ.type === 'mcq' ? 'MCQ (1 Mark)' : 'Programming (5 Marks)'}
              </span>
            </div>
          </div>

          {/* Question Text */}
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 mb-5 text-white text-sm leading-relaxed">
            {currentQ.questionText}
          </div>

          {/* MCQ Option Choices */}
          {currentQ.type === 'mcq' ? (
            <div className="space-y-3 mb-6">
              {currentQ.options.map((opt, oIdx) => {
                const selected = studentAnswers[currentQ._id] === oIdx;
                return (
                  <button
                    key={oIdx}
                    onClick={() => handleAnswerSelect(currentQ._id, oIdx)}
                    className={`w-full text-left p-4 rounded-xl text-sm border transition-all flex items-start space-x-3 ${
                      selected
                        ? 'bg-blue-600/20 border-blue-500 text-white font-medium'
                        : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        selected ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Programming Question Workspace */
            <div className="space-y-3 mb-6 flex-1 flex flex-col">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-amber-300 flex items-center space-x-1.5">
                  <Code className="h-4 w-4" />
                  <span>Code Editor (Protected)</span>
                </label>

                {/* RUN PROGRAM OPTION */}
                <button
                  type="button"
                  onClick={() => handleRunCode(currentQ._id)}
                  disabled={runningCode}
                  className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center space-x-1.5 transition-all disabled:opacity-50"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>{runningCode ? 'Running Program...' : 'Run Code (Test)'}</span>
                </button>
              </div>

              {/* Protected Code Editor */}
              <textarea
                value={
                  studentAnswers[currentQ._id] !== undefined
                    ? studentAnswers[currentQ._id]
                    : currentQ.sampleCode || ''
                }
                onChange={(e) => handleAnswerSelect(currentQ._id, e.target.value)}
                placeholder="// Write your code solution here..."
                rows={13}
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                style={{ tabSize: 4 }}
                onCopy={(e) => { e.preventDefault(); triggerMalpracticeStrike('Copying code is blocked!'); }}
                onPaste={(e) => { e.preventDefault(); triggerMalpracticeStrike('Pasting code is blocked!'); }}
                onCut={(e) => { e.preventDefault(); triggerMalpracticeStrike('Cutting code is blocked!'); }}
                onKeyDown={(e) => {
                  const ta = e.target;
                  const start = ta.selectionStart;
                  const end = ta.selectionEnd;
                  const value = ta.value;

                  // TAB key: insert 4 spaces
                  if (e.key === 'Tab') {
                    e.preventDefault();
                    const spaces = '    ';
                    const newVal = value.substring(0, start) + spaces + value.substring(end);
                    handleAnswerSelect(currentQ._id, newVal);
                    requestAnimationFrame(() => {
                      ta.selectionStart = ta.selectionEnd = start + spaces.length;
                    });
                    return;
                  }

                  // ENTER key: auto-indent matching current line + extra indent after {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
                    const currentLine = value.substring(lineStart, start);
                    const indentMatch = currentLine.match(/^(\s*)/);
                    let indent = indentMatch ? indentMatch[1] : '';
                    if (currentLine.trimEnd().endsWith('{')) {
                      indent += '    ';
                    }
                    const insertion = '\n' + indent;
                    const newVal = value.substring(0, start) + insertion + value.substring(end);
                    handleAnswerSelect(currentQ._id, newVal);
                    requestAnimationFrame(() => {
                      ta.selectionStart = ta.selectionEnd = start + insertion.length;
                    });
                    return;
                  }

                  // } key: auto de-indent one level when line is only whitespace
                  if (e.key === '}') {
                    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
                    const currentLine = value.substring(lineStart, start);
                    if (currentLine.trim() === '') {
                      e.preventDefault();
                      const newIndent =
                        currentLine.length >= 4
                          ? currentLine.substring(0, currentLine.length - 4)
                          : '';
                      const newVal =
                        value.substring(0, lineStart) + newIndent + '}' + value.substring(end);
                      handleAnswerSelect(currentQ._id, newVal);
                      requestAnimationFrame(() => {
                        ta.selectionStart = ta.selectionEnd = lineStart + newIndent.length + 1;
                      });
                    }
                  }
                }}
                className="w-full p-4 bg-slate-900 border border-slate-800 rounded-2xl text-emerald-400 font-mono text-sm leading-7 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 resize-y select-text"
              />

              <div className="flex items-center justify-between text-xs text-slate-500">
                <p>
                  💡 <strong className="text-slate-400">Tab</strong> = 4 spaces &nbsp;|&nbsp;{' '}
                  <strong className="text-slate-400">Enter</strong> = auto-indent &nbsp;|&nbsp;{' '}
                  <strong className="text-slate-400">{'}'}</strong> = auto de-indent
                </p>
                <span className="text-[11px] text-amber-400/80">
                  ⚡ Auto-saved continuously. Evaluated upon submit.
                </span>
              </div>

              {/* RUN OUTPUT CONSOLE */}
              {currentRunResult && (
                <div
                  className={`mt-2 p-4 rounded-2xl border text-xs font-mono transition-all ${
                    currentRunResult.passed
                      ? 'bg-slate-900 border-emerald-500/40'
                      : 'bg-slate-900 border-rose-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold flex items-center space-x-1.5 text-slate-200">
                      <Terminal className="h-4 w-4" />
                      <span>Program Execution Output:</span>
                    </span>

                    <span
                      className={`font-bold px-3 py-0.5 rounded-full text-[11px] border ${
                        currentRunResult.passed
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {currentRunResult.passed ? 'RESULT: PASS ✓' : 'RESULT: FAIL ✗'}
                    </span>
                  </div>

                  <p
                    className={`mb-3 font-semibold ${
                      currentRunResult.passed ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {currentRunResult.feedback}
                  </p>

                  {/* Test Cases Table */}
                  {currentRunResult.testCaseResults &&
                    currentRunResult.testCaseResults.length > 0 && (
                      <div className="space-y-1.5 border-t border-slate-800 pt-2">
                        {currentRunResult.testCaseResults.map((tc, tcIdx) => (
                          <div
                            key={tcIdx}
                            className={`p-2 rounded-xl border text-[11px] flex flex-wrap items-center justify-between gap-2 ${
                              tc.passed
                                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                                : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                            }`}
                          >
                            <span className="font-bold">Test Case #{tc.caseNumber}</span>
                            <span className="text-slate-400">
                              Input: <code className="text-white">{tc.input}</code>
                            </span>
                            <span className="text-slate-400">
                              Expected: <code className="text-white">{tc.expectedOutput}</code>
                            </span>
                            <span
                              className={`font-black ${
                                tc.passed ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {tc.passed ? 'PASS ✓' : 'FAIL ✗'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              )}
            </div>
          )}

          {/* Bottom Navigation & Submission Buttons */}
          <div className="mt-auto pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx(currentIdx - 1)}
              className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 text-xs font-medium border border-slate-800 hover:bg-slate-800 disabled:opacity-40 flex items-center space-x-1"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            {currentIdx < testData.questions.length - 1 ? (
              <button
                onClick={() => setCurrentIdx(currentIdx + 1)}
                className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 shadow-md flex items-center space-x-1"
              >
                <span>Next Question</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => handleFinalSubmit(false, '')}
                disabled={submitting}
                className="px-8 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 flex items-center space-x-2 shadow-lg shadow-emerald-600/20"
              >
                <Check className="h-4 w-4" />
                <span>{submitting ? 'Evaluating Test...' : 'Finish & Submit Test'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

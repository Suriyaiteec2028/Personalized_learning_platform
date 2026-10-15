import React, { useState, useEffect } from 'react';
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
  PieChart
} from 'lucide-react';

export default function SecureTestModal({ testData, onClose, onTestCompleted }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [studentAnswers, setStudentAnswers] = useState({});
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [warningMessage, setWarningMessage] = useState('');
  const [startTime] = useState(new Date());
  const [timeLeftSeconds, setTimeLeftSeconds] = useState((testData.durationMinutes || 30) * 60);
  const [submitting, setSubmitting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Run Code states
  const [runningCode, setRunningCode] = useState(false);
  const [runResults, setRunResults] = useState({}); // map of questionId -> result
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState(null);

  // Result view active tab: 'overview' | 'questions'
  const [resultTab, setResultTab] = useState('questions');

  // Anti-cheat restriction handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.key.startsWith('F') ||
        (e.ctrlKey && ['c', 'v', 'a', 'x', 'u', 'i'].includes(e.key.toLowerCase())) ||
        (e.altKey && e.key === 'Tab')
      ) {
        e.preventDefault();
        setWarningMessage('Restricted key detected! Shortcuts disabled in secure test mode.');
        setTimeout(() => setWarningMessage(''), 4000);
      }
    };
    const handleVisibility = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const n = prev + 1;
          setWarningMessage(`ALERT: Tab switch detected! (Count: ${n}). Tab switching is prohibited.`);
          setTimeout(() => setWarningMessage(''), 5000);
          return n;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Timer Countdown
  useEffect(() => {
    if (testResult) return;
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [testResult]);

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // Auto-save handler: updates state immediately on typing
  const handleAnswerSelect = (qId, val) => {
    setStudentAnswers((prev) => ({ ...prev, [qId]: val }));
    setLastAutoSaveTime(new Date());
  };

  // Run Code feature for programming questions
  const handleRunCode = async (questionId) => {
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

  // Final Submit: automatically considers the last typed code even if student never clicked Run
  const handleFinalSubmit = async () => {
    if (submitting || testResult) return;
    setSubmitting(true);
    const endTime = new Date();

    const formattedAnswers = testData.questions.map((q) => {
      // Last typed code or sampleCode is automatically used
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
        tabSwitchCount,
        answers: formattedAnswers
      };

      const res = await API.post('/tests/submit', payload);
      setTestResult(res.data);
      if (onTestCompleted) onTestCompleted(res.data);
    } catch (err) {
      alert('Error submitting test: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const currentQ = testData.questions[currentIdx];

  // ═══════════════════════════════════════════════════════════════════════════
  // RESULT SUMMARY SCREEN (POST-SUBMIT)
  // ═══════════════════════════════════════════════════════════════════════════
  if (testResult) {
    const questionsList = testResult.questionResults || [];

    return (
      <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-lg flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl text-slate-100 max-h-[92vh] flex flex-col">
          {/* Header */}
          <div className="text-center mb-5 flex-shrink-0">
            <div className="inline-flex p-3 bg-emerald-500/20 text-emerald-400 rounded-full mb-2 border border-emerald-500/30">
              <Award className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-black text-white">Test Completed & Evaluated!</h2>
            <p className="text-xs text-slate-400 mt-1">{testResult.testTitle}</p>
          </div>

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
              <span>Security Warnings:{' '}</span>
              <strong
                className={
                  testResult.tabSwitchCount > 0 ? 'text-rose-400' : 'text-emerald-400'
                }
              >
                {testResult.tabSwitchCount} tab switch(es)
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
              <span>Question-by-Question Marks Breakdown ({questionsList.length})</span>
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
              /* Question-by-Question Marks Summary */
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

                      {/* Marks Score Display for this question */}
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

                        {/* Test case breakdown if available */}
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
              /* Topic Skill Analysis Breakdown */
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
  // ACTIVE TEST WINDOW
  // ═══════════════════════════════════════════════════════════════════════════
  const currentRunResult = runResults[currentQ?._id];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <div className="p-1.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg">
            <Shield className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">{testData.courseTitle || 'Course Test'}</h3>
            <span className="text-xs text-slate-400">
              Secure Assessment Mode | Total Questions: {testData.totalQuestions}
            </span>
          </div>
        </div>

        {/* Tab switch warnings */}
        {tabSwitchCount > 0 && (
          <div className="hidden sm:flex items-center space-x-2 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs px-3 py-1 rounded-full">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>
              Tab Switches: <strong>{tabSwitchCount}</strong>
            </span>
          </div>
        )}

        {/* Countdown Timer */}
        <div className="flex items-center space-x-2 bg-slate-950 px-4 py-1.5 rounded-xl border border-slate-800">
          <Clock className="h-4 w-4 text-amber-400" />
          <span className="font-mono text-sm font-bold text-amber-300 tracking-wider">
            {formatTime(timeLeftSeconds)}
          </span>
        </div>
      </div>

      {/* Security Toast Warning */}
      {warningMessage && (
        <div className="bg-rose-600 text-white text-xs font-semibold px-6 py-2 flex items-center justify-center space-x-2">
          <AlertTriangle className="h-4 w-4" />
          <span>{warningMessage}</span>
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

          <div className="mt-auto pt-4 border-t border-slate-800 text-xs text-slate-400 space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500/50" />
              <span>Answered</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded bg-slate-950 border border-slate-800" />
              <span>Unanswered</span>
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
            /* Programming Question Workspace with Run Option */
            <div className="space-y-3 mb-6 flex-1 flex flex-col">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-amber-300 flex items-center space-x-1.5">
                  <Code className="h-4 w-4" />
                  <span>Code Editor</span>
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

              {/* Smart Code Editor with Tab/Enter indentation */}
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
                  ⚡ Latest typed code is auto-saved and evaluated upon submit
                </span>
              </div>

              {/* RUN OUTPUT CONSOLE (PASS / FAIL RESULT DISPLAY) */}
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
                onClick={handleFinalSubmit}
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

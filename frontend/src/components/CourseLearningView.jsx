import React, { useState } from 'react';
import API from '../services/api';
import { BookOpen, CheckCircle, Circle, Play, Award, Code, CheckSquare, ChevronRight, FileText, Sparkles } from 'lucide-react';

export default function CourseLearningView({ course, enrollment, onBack, onStartTest }) {
  const [selectedModuleIdx, setSelectedModuleIdx] = useState(0);
  const [selectedTopicIdx, setSelectedTopicIdx] = useState(0);
  const [completedTopics, setCompletedTopics] = useState(enrollment?.completedTopics || []);
  const [progressPercentage, setProgressPercentage] = useState(enrollment?.progressPercentage || 0);
  const [updating, setUpdating] = useState(false);

  const activeModule = course.modules[selectedModuleIdx] || course.modules[0];
  const activeTopic = activeModule?.topics[selectedTopicIdx] || activeModule?.topics[0];

  const handleToggleComplete = async (topicTitle) => {
    if (updating) return;
    setUpdating(true);
    const isCurrentlyCompleted = completedTopics.includes(topicTitle);
    try {
      const res = await API.post('/enrollments/update-progress', {
        courseId: course._id,
        topicTitle,
        completed: !isCurrentlyCompleted
      });
      setCompletedTopics(res.data.completedTopics || []);
      setProgressPercentage(res.data.progressPercentage || 0);
    } catch (err) {
      alert('Error updating progress: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-300 border border-slate-700 transition-colors">
            ← Back
          </button>
          <div>
            <h2 className="text-lg font-bold text-white">{course.title}</h2>
            <span className="text-xs text-blue-400 font-mono">{course.code} | {course.category}</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="hidden sm:block text-right">
            <span className="text-xs text-slate-400 block">Progress</span>
            <span className="text-sm font-bold text-emerald-400">{progressPercentage}%</span>
          </div>
          <div className="w-28 bg-slate-950 rounded-full h-2.5 border border-slate-800 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full transition-all duration-500 rounded-full" style={{ width: `${progressPercentage}%` }} />
          </div>
          <button onClick={() => onStartTest(course._id)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5">
            <Award className="h-4 w-4" /><span>Take Test</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="w-full lg:w-72 bg-slate-900/70 border-r border-slate-800 p-4 overflow-y-auto">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 px-2">Modules & Topics</h3>
          <div className="space-y-3">
            {course.modules.map((mod, mIdx) => (
              <div key={mIdx} className="bg-slate-950/80 rounded-2xl border border-slate-800 overflow-hidden">
                <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800/80">
                  <span className="text-xs font-bold text-slate-200">M{mod.moduleNumber}: {mod.title}</span>
                </div>
                <div className="p-2 space-y-1">
                  {mod.topics.map((top, tIdx) => {
                    const isDone = completedTopics.includes(top.title);
                    const isActive = selectedModuleIdx === mIdx && selectedTopicIdx === tIdx;
                    return (
                      <button key={tIdx} onClick={() => { setSelectedModuleIdx(mIdx); setSelectedTopicIdx(tIdx); }}
                        className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center space-x-2 transition-all ${
                          isActive ? 'bg-blue-600/20 border border-blue-500/50 text-white font-semibold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                        }`}>
                        {isDone ? <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" /> : <Circle className="h-4 w-4 text-slate-600 flex-shrink-0" />}
                        <span className="truncate">{top.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-slate-950">
          {activeTopic ? (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block mb-1">Module {activeModule.moduleNumber} • Topic {activeTopic.topicNumber}</span>
                  <h1 className="text-2xl font-extrabold text-white">{activeTopic.title}</h1>
                </div>
                <button disabled={updating} onClick={() => handleToggleComplete(activeTopic.title)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                    completedTopics.includes(activeTopic.title)
                      ? 'bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30'
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}>
                  <CheckSquare className="h-4 w-4" />
                  <span>{completedTopics.includes(activeTopic.title) ? 'Completed ✓' : 'Mark as Complete'}</span>
                </button>
              </div>

              <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-blue-400" /><span>Explanation</span>
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{activeTopic.explanation}</p>
              </div>

              {activeTopic.codeExample && (
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-3">
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                    <Code className="h-4 w-4 text-amber-400" /><span>Code Example</span>
                  </h3>
                  <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed">{activeTopic.codeExample}</pre>
                </div>
              )}

              {activeTopic.diagram && (
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-3">
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-purple-400" /><span>Visual Diagram</span>
                  </h3>
                  <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-indigo-300 font-mono text-xs overflow-x-auto leading-relaxed">{activeTopic.diagram}</pre>
                </div>
              )}

              {activeTopic.practicalNotes && (
                <div className="bg-blue-950/40 p-5 rounded-2xl border border-blue-800/60 text-blue-200 text-xs space-y-1">
                  <span className="font-bold text-blue-300 block uppercase">Key Takeaway:</span>
                  <p>{activeTopic.practicalNotes}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 text-slate-500">Select a topic from the sidebar to begin learning.</div>
          )}
        </div>
      </div>
    </div>
  );
}

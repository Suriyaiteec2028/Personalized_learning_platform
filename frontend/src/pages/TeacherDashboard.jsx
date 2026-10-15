import React, { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Key, Users, BookOpen, Award, Activity, UserMinus, X, Eye, Phone, Building, GraduationCap, CheckCircle, AlertTriangle, ExternalLink, RefreshCw } from 'lucide-react';

export default function TeacherDashboard() {
  const { user, updateProfile } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('manage-students'); // 'manage-students' | 'profile'
  const [studentsData, setStudentsData] = useState({ teacherCode: '', totalConnectedStudents: 0, students: [] });
  const [loading, setLoading] = useState(true);
  const [selectedStudentActivity, setSelectedStudentActivity] = useState(null);
  const [activityLoading, setActivityLoading] = useState(false);

  // Profile Form States
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [institution, setInstitution] = useState(user?.institution || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [qualification, setQualification] = useState(user?.qualification || '');
  const [profileMsg, setProfileMsg] = useState('');

  useEffect(() => {
    fetchConnectedStudents();
  }, []);

  const fetchConnectedStudents = async () => {
    try {
      setLoading(true);
      const res = await API.get('/teacher/students');
      setStudentsData(res.data);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStudentActivity = async (studentId) => {
    try {
      setActivityLoading(true);
      const res = await API.get(`/teacher/student-activity/${studentId}`);
      setSelectedStudentActivity(res.data);
    } catch (err) {
      alert('Error fetching student activity: ' + (err.response?.data?.message || err.message));
    } finally {
      setActivityLoading(false);
    }
  };

  const handleRemoveStudent = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to remove student "${studentName}" from your connected student list? The student's account and learning history will be preserved.`)) {
      return;
    }

    try {
      await API.delete(`/teacher/remove-student/${studentId}`);
      setSelectedStudentActivity(null);
      await fetchConnectedStudents();
      alert(`Student ${studentName} successfully removed from your list.`);
    } catch (err) {
      alert('Error removing student: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    try {
      await updateProfile({ name, phone, institution, department, qualification });
      setProfileMsg('Profile updated successfully!');
      setTimeout(() => setProfileMsg(''), 4000);
    } catch (err) {
      alert('Error updating profile: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      {/* Prominent Teacher Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border-b border-slate-800 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">Teacher Management Interface</span>
            <h1 className="text-2xl font-black text-white">Welcome, {user?.name}</h1>
            <p className="text-xs text-slate-400 mt-1">
              Share your 8-digit unique code with students to connect them to your management monitoring view.
            </p>
          </div>

          {/* Prominent 8-Digit Alphanumeric Teacher Code Card */}
          <div className="bg-slate-900/90 border-2 border-amber-500/50 p-4 rounded-2xl shadow-xl flex items-center space-x-4">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <Key className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Your 8-Digit Unique Teacher Code</span>
              <span className="font-mono text-xl font-black text-amber-300 tracking-widest select-all bg-slate-950 px-3 py-1 rounded-lg border border-amber-500/30 inline-block mt-0.5">
                {user?.teacherCode || studentsData.teacherCode}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        
        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">Connected Students</span>
              <Users className="h-5 w-5 text-blue-400" />
            </div>
            <span className="text-3xl font-black text-white">{studentsData.totalConnectedStudents}</span>
          </div>

          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">Courses Monitored</span>
              <BookOpen className="h-5 w-5 text-emerald-400" />
            </div>
            <span className="text-3xl font-black text-emerald-400">3 Default</span>
          </div>

          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">Tests Evaluated</span>
              <Award className="h-5 w-5 text-amber-400" />
            </div>
            <span className="text-3xl font-black text-amber-400">Active</span>
          </div>

          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">System Status</span>
              <Activity className="h-5 w-5 text-purple-400" />
            </div>
            <span className="text-sm font-bold text-purple-300">Intelligent Recommender Active</span>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex border-b border-slate-800 mb-6 space-x-4">
          <button
            onClick={() => setActiveTab('manage-students')}
            className={`pb-3 px-2 font-semibold text-sm transition-all border-b-2 flex items-center space-x-2 ${
              activeTab === 'manage-students'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Manage Students ({studentsData.totalConnectedStudents})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-2 font-semibold text-sm transition-all border-b-2 flex items-center space-x-2 ${
              activeTab === 'profile'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            <span>Teacher Profile</span>
          </button>
        </div>

        {/* TAB 1: MANAGE STUDENTS */}
        {activeTab === 'manage-students' && (
          <div className="space-y-6">
            
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Assigned Student Monitoring Directory</h2>
              <button
                onClick={fetchConnectedStudents}
                className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-lg text-xs text-slate-300 flex items-center space-x-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Refresh Directory</span>
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-slate-500">Loading connected student roster...</div>
            ) : studentsData.students.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-3">
                <Users className="h-12 w-12 text-slate-600 mx-auto" />
                <h3 className="text-lg font-bold text-white">No Students Connected Yet</h3>
                <p className="text-xs max-w-md mx-auto">
                  Provide your 8-digit teacher code <strong className="text-amber-300 font-mono">{user?.teacherCode}</strong> to your students. They can enter this code in their Student Profile to connect to your dashboard.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {studentsData.students.map((student) => (
                  <div key={student._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all">
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-white text-base">{student.name}</h3>
                          <span className="text-xs text-slate-400 block font-mono">{student.rollNumber || 'No Roll #'}</span>
                        </div>
                        <span className="bg-blue-500/20 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-500/30">
                          {student.department || 'Computer Science'}
                        </span>
                      </div>

                      <div className="mt-3 text-xs space-y-1 text-slate-400">
                        <p>📧 {student.email}</p>
                        <p>🏛️ {student.institution || 'University Institute'}</p>
                        <p>📚 Enrolled Courses: <strong className="text-white">{student.totalEnrolledCourses}</strong></p>
                        <p>📝 Tests Taken: <strong className="text-amber-400">{student.totalTestsAttempted}</strong></p>
                        <p>⭐ Avg Test Score: <strong className="text-emerald-400">{student.averageTestScore}%</strong></p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleOpenStudentActivity(student._id)}
                        className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center space-x-1.5 shadow-md shadow-blue-600/20 transition-all"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View Detailed Activity</span>
                      </button>

                      <button
                        onClick={() => handleRemoveStudent(student._id, student.name)}
                        title="Remove Student"
                        className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30 transition-colors"
                      >
                        <UserMinus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* TAB 2: TEACHER PROFILE */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6">Teacher Profile Details</h2>

            {/* Read-Only Prominent Teacher Code Card */}
            <div className="mb-6 bg-slate-950 p-4 rounded-xl border border-amber-500/40 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase block">Your 8-Digit Unique Teacher Code</span>
                <span className="font-mono text-xl font-black text-amber-300 tracking-widest">{user?.teacherCode}</span>
              </div>
              <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20 font-semibold">
                Permanent Unique Code
              </span>
            </div>

            {profileMsg && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                {profileMsg}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address (Read-Only Login Email)</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-500 text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Institution Name</label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Highest Qualification</label>
                  <input
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition-all text-sm"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>

          </div>
        )}

      </div>

      {/* DETAILED STUDENT ACTIVITY MODAL */}
      {selectedStudentActivity && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div>
                <span className="text-xs font-bold text-blue-400 uppercase">Live Student Activity Inspection</span>
                <h2 className="text-2xl font-black text-white">{selectedStudentActivity.studentInfo.name}</h2>
                <p className="text-xs text-slate-400 font-mono">
                  {selectedStudentActivity.studentInfo.email} | Roll #: {selectedStudentActivity.studentInfo.rollNumber || 'N/A'}
                </p>
              </div>

              <button
                onClick={() => setSelectedStudentActivity(null)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              
              {/* Personal Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block">Institution</span>
                  <span className="font-semibold text-white">{selectedStudentActivity.studentInfo.institution || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Department</span>
                  <span className="font-semibold text-white">{selectedStudentActivity.studentInfo.department || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Gender</span>
                  <span className="font-semibold text-white">{selectedStudentActivity.studentInfo.gender || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Enrolled Courses</span>
                  <span className="font-bold text-emerald-400">{selectedStudentActivity.enrolledCoursesCount}</span>
                </div>
              </div>

              {/* Enrolled Courses & Progress */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Enrolled Courses & Progress</h4>
                {selectedStudentActivity.enrolledCoursesDetails.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No courses enrolled yet.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedStudentActivity.enrolledCoursesDetails.map((c, i) => (
                      <div key={i} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-white">{c.courseTitle} ({c.courseCode})</span>
                          <span className="text-[11px] text-slate-400 block">
                            Completed Topics: {c.completedTopicsCount} | Last Studied: {c.lastStudiedTopic || 'None'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-emerald-400 text-sm">{c.progressPercentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Test Attempts & Timing Monitoring */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Test Attempt Logs (Start & End Times)</h4>
                {selectedStudentActivity.testAttempts.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Student has not attempted any tests yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                        <tr>
                          <th className="p-2.5 rounded-l-lg">Test Title</th>
                          <th className="p-2.5">Score %</th>
                          <th className="p-2.5">MCQ / Coding</th>
                          <th className="p-2.5">Start Time</th>
                          <th className="p-2.5">End Time</th>
                          <th className="p-2.5 rounded-r-lg">Tab Switches</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {selectedStudentActivity.testAttempts.map((ta, i) => (
                          <tr key={i} className="hover:bg-slate-950/50">
                            <td className="p-2.5 font-semibold text-white">{ta.testTitle}</td>
                            <td className="p-2.5 font-bold text-emerald-400">{ta.scorePercentage}%</td>
                            <td className="p-2.5 text-slate-300">{ta.mcqMarks} MCQ | {ta.programmingMarks} Code</td>
                            <td className="p-2.5 text-slate-400">{new Date(ta.startTime).toLocaleTimeString()}</td>
                            <td className="p-2.5 text-slate-400">{new Date(ta.endTime).toLocaleTimeString()}</td>
                            <td className={`p-2.5 font-bold ${ta.tabSwitchCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                              {ta.tabSwitchCount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Strengths & Weak Topics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
                  <h5 className="font-bold text-emerald-400 uppercase tracking-wider mb-2">Student Strengths</h5>
                  {selectedStudentActivity.strengths.length === 0 ? (
                    <p className="text-slate-500 italic">No evaluated strong topics yet.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedStudentActivity.strengths.map((s, i) => (
                        <span key={i} className="bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-md border border-emerald-500/30">
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
                  <h5 className="font-bold text-rose-400 uppercase tracking-wider mb-2">Student Weak Topics</h5>
                  {selectedStudentActivity.weakTopics.length === 0 ? (
                    <p className="text-slate-500 italic">No weak topics recorded.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {selectedStudentActivity.weakTopics.map((wt, i) => (
                        <div key={i} className="bg-rose-500/10 text-rose-300 p-2 rounded-md border border-rose-500/30">
                          <span className="font-semibold block">{wt.topicTitle} (Skill: {wt.skillPercentage}%)</span>
                          <span className="text-[10px] text-slate-400">{wt.reason}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Test Eligibility Monitoring View */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
                <h5 className="font-bold text-amber-300 uppercase tracking-wider mb-2">Course Test Eligibility Status</h5>
                <div className="space-y-2">
                  {selectedStudentActivity.eligibleTests.map((et, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-slate-900 rounded-xl border border-slate-800">
                      <span>{et.courseTitle} ({et.courseCode})</span>
                      <span className={`font-semibold px-2 py-0.5 rounded ${et.isEligible ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                        {et.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* System Recommendations Overview */}
              <div className="bg-blue-950/40 p-4 rounded-2xl border border-blue-800/60 text-xs text-blue-200 space-y-1">
                <h5 className="font-bold text-blue-300 uppercase tracking-wider mb-1">System Recommendations Generated</h5>
                {selectedStudentActivity.systemRecommendations.map((rec, i) => (
                  <p key={i}>💡 {rec}</p>
                ))}
              </div>

              {/* Remove Student Action Button */}
              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => handleRemoveStudent(selectedStudentActivity.studentInfo._id, selectedStudentActivity.studentInfo.name)}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl flex items-center space-x-2 shadow-lg shadow-rose-600/20"
                >
                  <UserMinus className="h-4 w-4" />
                  <span>Remove Student from Teacher List</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

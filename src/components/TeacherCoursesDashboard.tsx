import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function TeacherCoursesDashboard({ userId }: { userId: string }) {
  const [courses, setCourses] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', subject: '', year: '', isPublic: false });
  const [joinCode, setJoinCode] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch courses created by teacher
    axios.get('/api/teacher-courses?userId=' + userId).then(res => setCourses(res.data));
  }, [userId]);

  const handleCreate = async () => {
    setMessage('');
    try {
      const res = await axios.post('/api/courses', { ...form, createdBy: userId });
      setCourses([...courses, res.data]);
      setShowCreate(false);
      setForm({ name: '', description: '', subject: '', year: '', isPublic: false });
      setMessage('Tečaj uspešno ustvarjen!');
    } catch (e: any) {
      setMessage(e.response?.data?.error || 'Napaka pri ustvarjanju tečaja.');
    }
  };

  const handleJoin = async () => {
    setMessage('');
    try {
      const res = await axios.put('/api/courses', { joinCode, userId });
      setCourses([...courses, res.data.course]);
      setShowJoin(false);
      setJoinCode('');
      setMessage('Uspešno pridružen tečaju!');
    } catch (e: any) {
      setMessage(e.response?.data?.error || 'Napaka pri pridružitvi tečaju.');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Moji tečaji</h2>
      <div className="flex gap-4 mb-6">
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => setShowCreate(true)}>Ustvari tečaj</button>
        <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={() => setShowJoin(true)}>Pridruži se tečaju</button>
      </div>
      {message && <div className="mb-4 text-red-600">{message}</div>}
      {showCreate && (
        <div className="border p-4 mb-4 rounded bg-gray-50">
          <h3 className="font-semibold mb-2">Ustvari nov tečaj</h3>
          <input className="border p-2 mb-2 w-full" placeholder="Ime tečaja" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <textarea className="border p-2 mb-2 w-full" placeholder="Opis" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <input className="border p-2 mb-2 w-full" placeholder="Predmet" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
          <input className="border p-2 mb-2 w-full" placeholder="Šolsko leto" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} />
          <label className="flex items-center mb-2">
            <input type="checkbox" checked={form.isPublic} onChange={e => setForm(f => ({ ...f, isPublic: e.target.checked }))} />
            <span className="ml-2">Javni tečaj</span>
          </label>
          <div className="flex gap-2">
            <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleCreate}>Shrani</button>
            <button className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => setShowCreate(false)}>Prekliči</button>
          </div>
        </div>
      )}
      {showJoin && (
        <div className="border p-4 mb-4 rounded bg-gray-50">
          <h3 className="font-semibold mb-2">Pridruži se tečaju</h3>
          <input className="border p-2 mb-2 w-full" placeholder="Koda za pridružitev" value={joinCode} onChange={e => setJoinCode(e.target.value)} />
          <div className="flex gap-2">
            <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleJoin}>Pridruži se</button>
            <button className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => setShowJoin(false)}>Prekliči</button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courses.map(course => (
          <div key={course.id} className="border rounded p-4 bg-white shadow">
            <h4 className="text-lg font-bold mb-1">{course.name}</h4>
            <div className="mb-2 text-gray-700">{course.description}</div>
            <div className="mb-1 text-sm">Predmet: {course.subject || '-'}</div>
            <div className="mb-1 text-sm">Šolsko leto: {course.year || '-'}</div>
            <div className="mb-1 text-sm">Koda za pridružitev: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{course.joinCode}</span></div>
            <div className="mb-1 text-sm">Javni: {course.isPublic ? 'Da' : 'Ne'}</div>
            <div className="mt-2">
              <button className="bg-indigo-600 text-white px-3 py-1 rounded">Upravljaj tečaj</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

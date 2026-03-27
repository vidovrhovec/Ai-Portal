import { useState, useEffect } from 'react';
import axios from 'axios';

export default function CourseMembers({ courseId }: { courseId: string }) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get(`/api/enrollments?courseId=${courseId}`)
      .then(res => setMembers(res.data.map((enrollment: any) => ({
        id: enrollment.student.id,
        name: enrollment.student.name,
        email: enrollment.student.email,
        status: 'enrolled',
        progress: { completedTasks: 0 } // TODO: Add actual progress tracking
      }))))
      .finally(() => setLoading(false));
  }, [courseId]);

  const handleAddMember = async () => {
    setMessage('');
    try {
      console.log('CourseMembers: Searching for user by email:', email);
      // First find the user by email
      const userRes = await axios.get(`/api/users/search?email=${encodeURIComponent(email)}`);
      console.log('CourseMembers: User search response:', userRes);
      if (!userRes.data || userRes.data.length === 0) {
        setMessage('Uporabnik z tem emailom ne obstaja.');
        return;
      }

      const studentId = userRes.data[0].id;
      console.log('CourseMembers: Enrolling student:', studentId);
      const res = await axios.post('/api/enrollments', { courseId, studentId });
      console.log('CourseMembers: Enrollment response:', res);
      setMembers([...members, {
        id: res.data.student.id,
        name: res.data.student.name,
        email: res.data.student.email,
        status: 'enrolled',
        progress: { completedTasks: 0 }
      }]);
      setEmail('');
      setMessage('Član uspešno dodan!');
    } catch (e: any) {
      console.error('CourseMembers: Error:', e);
      setMessage(e.response?.data?.error || 'Napaka pri dodajanju člana.');
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-xl font-bold mb-2">Člani tečaja</h3>
      <div className="mb-4 flex gap-2">
        <input className="border p-2 w-64" placeholder="Email učenca" value={email} onChange={e => setEmail(e.target.value)} />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleAddMember}>Dodaj člana</button>
      </div>
      {message && <div className="mb-2 text-green-700">{message}</div>}
      {loading ? (
        <div>Nalaganje ...</div>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">Ime</th>
              <th className="p-2">Email</th>
              <th className="p-2">Status</th>
              <th className="p-2">Napredek</th>
            </tr>
          </thead>
          <tbody>
            {members.map(member => (
              <tr key={member.id}>
                <td className="p-2">{member.name || '-'}</td>
                <td className="p-2">{member.email || '-'}</td>
                <td className="p-2">{member.status}</td>
                <td className="p-2">{member.progress?.completedTasks || 0} nalog</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

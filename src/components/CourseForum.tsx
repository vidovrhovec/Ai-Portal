import { useState, useEffect } from 'react';
import axios from 'axios';

export default function CourseForum({ courseId, userId }: { courseId: string, userId: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadForum = async () => {
      console.log('CourseForum: Component mounted for course:', courseId);
      // TODO: Course forum API doesn't exist yet
      // const res = await axios.get(`/api/course-forum?courseId=${courseId}`);
      // setMessages(res.data);
      setMessages([]); // Empty messages for now
      setLoading(false);
    };

    loadForum();
  }, [courseId]);

  const handleAddMessage = async () => {
    setMessage('');
    try {
      const res = await axios.post('/api/course-forum', { courseId, userId, title, content });
      setMessages([...messages, res.data]);
      setTitle('');
      setContent('');
      setMessage('Sporočilo uspešno dodano!');
    } catch (e: any) {
      setMessage(e.response?.data?.error || 'Napaka pri dodajanju sporočila.');
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-xl font-bold mb-2">Forum tečaja</h3>
      <div className="mb-4 flex gap-2">
        <input className="border p-2 w-48" placeholder="Naslov teme" value={title} onChange={e => setTitle(e.target.value)} />
        <input className="border p-2 w-96" placeholder="Vsebina sporočila" value={content} onChange={e => setContent(e.target.value)} />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleAddMessage}>Objavi</button>
      </div>
      {message && <div className="mb-2 text-green-700">{message}</div>}
      {loading ? (
        <div>Nalaganje ...</div>
      ) : (
        <ul>
          {messages.map(msg => (
            <li key={msg.id} className="mb-2 border-b pb-2">
              <div className="font-semibold">{msg.title}</div>
              <div>{msg.content}</div>
              <div className="text-xs text-gray-500">Objavil: {msg.userId} | {new Date(msg.createdAt).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

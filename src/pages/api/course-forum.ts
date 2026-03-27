import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { courseId } = req.query;
    if (!courseId || typeof courseId !== 'string') {
      return res.status(400).json({ error: 'Manjka courseId.' });
    }
    try {
      const forum = await prisma.courseForum.findFirst({ where: { courseId }, include: { messages: true } });
      return res.status(200).json(forum?.messages || []);
    } catch (error) {
      return res.status(500).json({ error: 'Napaka pri pridobivanju foruma.' });
    }
  }
  if (req.method === 'POST') {
    const { courseId, userId, title, content } = req.body;
    if (!courseId || !userId || !title || !content) {
      return res.status(400).json({ error: 'Manjkajoči podatki.' });
    }
    try {
      let forum = await prisma.courseForum.findFirst({ where: { courseId } });
      if (!forum) {
        forum = await prisma.courseForum.create({ data: { courseId, title: 'Forum' } });
      }
      const message = await prisma.courseForumMessage.create({
        data: {
          forumId: forum.id,
          userId,
          title,
          content,
        },
      });
      return res.status(201).json(message);
    } catch (error) {
      return res.status(500).json({ error: 'Napaka pri dodajanju sporočila.' });
    }
  }
  return res.status(405).json({ error: 'Metoda ni dovoljena.' });
}

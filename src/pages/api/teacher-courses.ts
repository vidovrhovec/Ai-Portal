import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { userId } = req.query;
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'Manjka userId.' });
    }
    try {
      // Tečaji, ki jih je ustvaril učitelj
      const createdCourses = await prisma.course.findMany({
        where: { teacherId: userId },
      });
      // Tečaji, kjer je uporabnik vpisan kot študent
      const enrollments = await prisma.courseEnrollment.findMany({
        where: { studentId: userId },
        include: { course: true },
      });
      const joinedCourses = enrollments.map(e => e.course);
      // Unikatni tečaji
      const allCourses = [
        ...createdCourses,
        ...joinedCourses.filter(jc => !createdCourses.find(c => c.id === jc.id)),
      ];
      return res.status(200).json(allCourses);
    } catch (error) {
      return res.status(500).json({ error: 'Napaka pri pridobivanju tečajev.' });
    }
  }
  return res.status(405).json({ error: 'Metoda ni dovoljena.' });
}

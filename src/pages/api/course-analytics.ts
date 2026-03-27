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
      const members = await prisma.courseEnrollment.findMany({
        where: { courseId },
        include: { student: true },
      });
      const memberCount = members.length;
      // For demo, analytics fields are not present in CourseEnrollment, so set to 0 or null
      const avgCompletedTasks = 0;
      const avgScore = 0;
      const topMember = members[0]?.studentId || null;
      return res.status(200).json({ memberCount, avgCompletedTasks, avgScore, topMember });
    } catch (error) {
      return res.status(500).json({ error: 'Napaka pri analitiki.' });
    }
  }
  return res.status(405).json({ error: 'Metoda ni dovoljena.' });
}

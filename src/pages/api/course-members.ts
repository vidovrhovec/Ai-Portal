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
        include: {
          student: true,
        },
      });
      // Pridobi osnovne podatke o uporabnikih (ime, email) iz User modela, če obstaja
      // Če User model ni v bazi, vrni samo userId
      // TODO: Integracija z User modelom
      return res.status(200).json(members);
    } catch (error) {
      return res.status(500).json({ error: 'Napaka pri pridobivanju članov.' });
    }
  }

  if (req.method === 'POST') {
    const { courseId, email } = req.body;
    if (!courseId || !email) {
      return res.status(400).json({ error: 'Manjkajoči podatki.' });
    }
    try {
      // Poišči uporabnika po emailu (če obstaja User model)
      // Če User model ni v bazi, generiraj userId iz emaila
      // TODO: Integracija z User modelom
      const userId = email; // Za demo namene
      // Preveri, če je že član
      const existing = await prisma.courseEnrollment.findFirst({ where: { courseId, studentId: userId } });
      if (existing) {
        return res.status(409).json({ error: 'Uporabnik je že član tečaja.' });
      }
      const member = await prisma.courseEnrollment.create({
        data: {
          courseId,
          studentId: userId,
          status: 'active',
        },
        include: {
          student: true,
        },
      });
      return res.status(201).json(member);
    } catch (error) {
      return res.status(500).json({ error: 'Napaka pri dodajanju člana.' });
    }
  }

  return res.status(405).json({ error: 'Metoda ni dovoljena.' });
}

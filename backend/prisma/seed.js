const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const db = new PrismaClient();

async function upsertUser(email, name, role, password) {
  const passwordHash = await bcrypt.hash(password, 12);
  return db.user.upsert({ where: { email }, update: {}, create: { email, name, role, passwordHash } });
}

async function main() {
  if (process.env.SEED_DEMO_DATA !== 'true') {
    console.log('Seed skipped. Set SEED_DEMO_DATA=true to create local demo accounts.');
    return;
  }
  const admin = await upsertUser('admin@school.com', 'School Super Admin', 'SUPER_ADMIN', 'Admin123!');
  const teacherUsers = await Promise.all([1, 2, 3].map((n) => upsertUser(`teacher${n}@school.com`, `Teacher ${n}`, 'TEACHER', 'Teacher123!')));
  const classes = await Promise.all([1, 2, 3].map((n) => db.schoolClass.upsert({ where: { name_year: { name: `Class ${n}`, year: new Date().getFullYear() } }, update: {}, create: { name: `Class ${n}`, year: new Date().getFullYear() } })));
  for (let i = 0; i < teacherUsers.length; i++) {
    const teacher = await db.teacher.upsert({ where: { userId: teacherUsers[i].id }, update: {}, create: { userId: teacherUsers[i].id } });
    await db.teacherClass.upsert({ where: { teacherId_classId: { teacherId: teacher.id, classId: classes[i].id } }, update: {}, create: { teacherId: teacher.id, classId: classes[i].id } });
  }
  for (let i = 1; i <= 10; i++) {
    const email = `student${i}@school.com`;
    const user = await upsertUser(email, `Student ${i}`, 'STUDENT', 'Student123!');
    await db.student.upsert({ where: { admissionNo: `ADM${String(i).padStart(4, '0')}` }, update: {}, create: { admissionNo: `ADM${String(i).padStart(4, '0')}`, userId: user.id, classId: classes[(i - 1) % classes.length].id } });
  }
  console.log(`Seeded demo data (admin id ${admin.id}). Demo credentials are documented in README.`);
}
main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => db.$disconnect());

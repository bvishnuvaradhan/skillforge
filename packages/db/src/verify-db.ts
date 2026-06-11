import { prisma, Role, Plan } from './index';

async function main() {
  console.log('Verifying database connection and client operations...');

  // 1. Create a dummy user
  const email = `test-${Date.now()}@example.com`;
  console.log(`Inserting test user: ${email}...`);
  const user = await prisma.user.create({
    data: {
      email,
      name: 'DB Test User',
      role: Role.student,
      plan: Plan.free,
    },
  });
  console.log('Created user:', user);

  // 2. Query the user back
  console.log(`Querying user: ${user.id}...`);
  const fetchedUser = await prisma.user.findUnique({
    where: { id: user.id },
  });
  console.log('Fetched user:', fetchedUser);

  if (!fetchedUser || fetchedUser.email !== email) {
    throw new Error('Database integrity check failed: user details do not match.');
  }

  // 3. Delete the user to clean up
  console.log(`Cleaning up test user: ${user.id}...`);
  await prisma.user.delete({
    where: { id: user.id },
  });
  console.log('Cleanup successful.');

  console.log('Database verification successful! All operations passed.');
}

main()
  .catch((err) => {
    console.error('Database verification failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

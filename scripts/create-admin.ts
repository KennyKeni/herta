import { auth } from '../src/modules/auth/service';

const email = process.argv[2];
const password = process.argv[3];
const name = process.argv[4] || 'Admin';

if (!email || !password) {
  console.error('Usage: bun scripts/create-admin.ts <email> <password> [name]');
  process.exit(1);
}

async function main() {
  try {
    const response = await auth.api.signUpEmail({
      body: { email, password, name },
    });

    if (!response.user) {
      console.error('Failed to create user');
      process.exit(1);
    }

    const { db } = await import('../src/infrastructure/db');

    await db
      .updateTable('user')
      .set({ role: 'admin' })
      .where('id', '=', response.user.id)
      .execute();

    console.log(`Admin user created: ${email} (id: ${response.user.id})`);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

main();

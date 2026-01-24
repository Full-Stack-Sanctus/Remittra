import { supabaseServer } from '@/lib/supabaseServer';

async function seed() {
  // Create admin user
  const { data: adminData, error: adminError } = await supabaseServer.auth.admin.createUser({
    email: "admin@demo.com",
    password: "Admin123!",
    email_confirm: true,
  });

  if (adminError) throw adminError;

  // Create regular test user
  const { data: userData, error: userError } = await supabaseServer.auth.admin.createUser({
    email: "user@demo.com",
    password: "User123!",
    email_confirm: true,
  });

  if (userError) throw userError;

  // Populate your app-level "users" table
  await supabaseServer.from("users").insert([
    {
      id: adminData.user!.id,
      email: "admin@demo.com",
      kyc_verified: true,
      is_admin: true,
      wallet_balance: 100000,
    },
    {
      id: userData.user!.id,
      email: "user@demo.com",
      kyc_verified: true,
      is_admin: false,
      wallet_balance: 5000,
    },
  ]);
  
  /*
  
  await supabase.from("ajos").insert([
    { name: "Team Ajo", created_by: adminData.user!.id, cycle_amount: 1000, current_cycle: 1 },
    { name: "Weekend Ajo", created_by: adminData.user!.id, cycle_amount: 500, current_cycle: 2 },
  ]);
  */

  console.log("Seeding complete");
}

seed().catch(console.error);

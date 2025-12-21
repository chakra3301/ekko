// Script to verify database rows after onboarding
// Run with: npx tsx scripts/verify-db.ts
import { prisma } from '../lib/prisma';

async function verifyDatabase() {
  console.log('🔍 Verifying database state...\n');

  try {
    // Count users
    const userCount = await prisma.user.count();
    console.log(`📊 Total Users: ${userCount}`);

    // Count artist profiles
    const artistCount = await prisma.artistProfile.count();
    console.log(`📊 Total Artist Profiles: ${artistCount}`);

    // Count client profiles
    const clientCount = await prisma.clientProfile.count();
    console.log(`📊 Total Client Profiles: ${clientCount}`);

    // Get users with profiles
    const usersWithProfiles = await prisma.user.findMany({
      where: {
        profileCompleted: true,
      },
      include: {
        artistProfile: true,
        clientProfile: true,
      },
    });

    console.log(`\n✅ Users with completed profiles: ${usersWithProfiles.length}`);

    if (usersWithProfiles.length > 0) {
      console.log('\n📋 Profile Details:');
      usersWithProfiles.forEach((user) => {
        console.log(`\n  User: ${user.email} (${user.role})`);
        if (user.artistProfile) {
          console.log(`    Artist Profile: ${user.artistProfile.displayName}`);
          console.log(`      Disciplines: ${user.artistProfile.disciplines.join(', ')}`);
          console.log(`      Availability: ${user.artistProfile.availability}`);
        }
        if (user.clientProfile) {
          console.log(`    Client Profile: ${user.clientProfile.companyName}`);
          console.log(`      Industry Tags: ${user.clientProfile.industryTags.join(', ')}`);
        }
      });
    }

    // Verify data integrity
    console.log('\n🔍 Verifying data integrity...');

    // Check for users with profiles but profileCompleted = false
    const inconsistentUsers = await prisma.user.findMany({
      where: {
        OR: [
          { artistProfile: { isNot: null }, profileCompleted: false },
          { clientProfile: { isNot: null }, profileCompleted: false },
        ],
      },
    });

    if (inconsistentUsers.length > 0) {
      console.log(`⚠️  Warning: Found ${inconsistentUsers.length} users with profiles but profileCompleted=false`);
      inconsistentUsers.forEach((user) => {
        console.log(`   - ${user.email}`);
      });
    } else {
      console.log('✅ All users with profiles have profileCompleted=true');
    }

    // Check for users without profiles but profileCompleted = true
    const incompleteUsers = await prisma.user.findMany({
      where: {
        profileCompleted: true,
        artistProfile: null,
        clientProfile: null,
      },
    });

    if (incompleteUsers.length > 0) {
      console.log(`⚠️  Warning: Found ${incompleteUsers.length} users with profileCompleted=true but no profile`);
      incompleteUsers.forEach((user) => {
        console.log(`   - ${user.email}`);
      });
    } else {
      console.log('✅ All users with profileCompleted=true have profiles');
    }

    console.log('\n✅ Database verification complete!');
  } catch (error) {
    console.error('❌ Error verifying database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabase();


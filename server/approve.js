const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Update all users to Active status
    const updateUsers = await prisma.user.updateMany({
        data: {
            status: 'Active',
        },
    });
    console.log(`Updated ${updateUsers.count} users to Active status.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

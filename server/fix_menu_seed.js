const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // 1. Get Roles
    const adminRole = await prisma.role.findUnique({ where: { name: 'Admin' } });
    const handlerRole = await prisma.role.findUnique({ where: { name: 'Handler' } });
    const reporterRole = await prisma.role.findUnique({ where: { name: 'Reporter' } });

    // 2. Get All Menus
    const allMenus = await prisma.menu.findMany();

    // 3. Assign ALL to Admin
    if (adminRole) {
        console.log('Assigning all menus to Admin...');
        for (const menu of allMenus) {
            await prisma.roleMenu.upsert({
                where: { roleId_menuId: { roleId: adminRole.id, menuId: menu.id } },
                update: {},
                create: { roleId: adminRole.id, menuId: menu.id }
            });
        }
    }

    // 4. Assign specific to Handler/Reporter (exclude Admin stuff)
    // Filter out paths starting with /admin
    const userMenus = allMenus.filter(m => !m.path.startsWith('/admin'));

    if (handlerRole) {
        console.log('Assigning user menus to Handler...');
        for (const menu of userMenus) {
            await prisma.roleMenu.upsert({
                where: { roleId_menuId: { roleId: handlerRole.id, menuId: menu.id } },
                update: {},
                create: { roleId: handlerRole.id, menuId: menu.id }
            });
        }
    }

    if (reporterRole) {
        console.log('Assigning user menus to Reporter...');
        for (const menu of userMenus) {
            await prisma.roleMenu.upsert({
                where: { roleId_menuId: { roleId: reporterRole.id, menuId: menu.id } },
                update: {},
                create: { roleId: reporterRole.id, menuId: menu.id }
            });
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());

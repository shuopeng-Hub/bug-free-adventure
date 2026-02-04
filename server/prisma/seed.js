const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const permissions = [
    // User Management
    { code: 'user:read', description: 'View user list' },
    { code: 'user:write', description: 'Create/Edit users' },
    { code: 'user:approve', description: 'Approve pending users' },

    // Project Management
    { code: 'project:read', description: 'View projects' },
    { code: 'project:write', description: 'Create/Edit projects' },
    { code: 'project:delete', description: 'Delete projects' },

    // Ticket Management
    { code: 'ticket:read', description: 'View tickets' },
    { code: 'ticket:create', description: 'Submit new tickets' },
    { code: 'ticket:handle', description: 'Process tickets (status change)' },
    { code: 'ticket:close', description: 'Close tickets' },
    { code: 'ticket:delete', description: 'Delete tickets' },

    // System
    { code: 'system:admin', description: 'Full System Access' }
];

const roles = [
    {
        name: 'Admin',
        displayName: '超级管理员',
        description: 'System Administrator with full access',
        perms: ['system:admin', 'user:read', 'user:write', 'user:approve', 'project:read', 'project:write', 'project:delete', 'ticket:read', 'ticket:create', 'ticket:handle', 'ticket:close', 'ticket:delete']
    },
    {
        name: 'Handler',
        displayName: '工程师',
        description: 'IT Support Verification Staff',
        perms: ['ticket:read', 'ticket:handle', 'ticket:close']
    },
    {
        name: 'Reporter',
        displayName: '普通用户',
        description: 'Standard user who can submit tickets',
        perms: ['ticket:read', 'ticket:create']
    }
];

async function main() {
    console.log('Start seeding...');

    // 1. Create Permissions
    for (const p of permissions) {
        await prisma.permission.upsert({
            where: { code: p.code },
            update: {},
            create: p,
        });
    }
    console.log('Permissions seeded.');

    // 2. Create Roles and assign Permissions
    for (const r of roles) {
        const role = await prisma.role.upsert({
            where: { name: r.name },
            update: {},
            create: {
                name: r.name,
                displayName: r.displayName,
                description: r.description
            }
        });

        // Find permission IDs
        const currentPerms = await prisma.permission.findMany({
            where: { code: { in: r.perms } }
        });

        // Create RolePermission relations
        for (const perm of currentPerms) {
            await prisma.rolePermission.upsert({
                where: {
                    roleId_permissionId: { roleId: role.id, permissionId: perm.id }
                },
                update: {},
                create: {
                    roleId: role.id,
                    permissionId: perm.id
                }
            });
        }
    }
    console.log('Roles seeded.');

    // 3. Create Default Admin User
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminRole = await prisma.role.findUnique({ where: { name: 'Admin' } });

    const admin = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {
            status: 'Active',
            department: 'IT'
        },
        create: {
            username: 'admin',
            password: hashedPassword,
            name: 'Super Admin',
            email: 'admin@example.com',
            department: 'IT',
            status: 'Active'
        }
    });

    // Assign Admin Role if not exists
    const existingRole = await prisma.userRole.findUnique({
        where: {
            userId_roleId: { userId: admin.id, roleId: adminRole.id }
        }
    });

    if (!existingRole) {
        await prisma.userRole.create({
            data: { userId: admin.id, roleId: adminRole.id }
        });
    }

    // Also ensure our mock users created before (if any) get a role? 
    // For now let's just ensure admin is there.

    // 4. Create Menus
    console.log('Seeding menus...');

    // Clear existing menus (optional, or rely on upsert if we had unique keys, but IDs track hierarchy)
    // For simplicity in this demo, we just create them if not exists or let's just create them fresh if DB is reset.
    // We'll trust upsert logic or just clean start. 
    // Let's use upsert with a known field if possible, or just create. 
    // Since we don't have unique on menu name/path, let's just create roots.

    const menus = [
        {
            name: '工作台', path: '/dashboard', component: 'Dashboard', icon: 'Odometer', sort: 1,
            children: []
        },
        {
            name: '工单管理', path: '/tickets', component: 'Layout', icon: 'Ticket', sort: 2,
            children: [
                { name: '工单列表', path: '/tickets', component: 'TicketList', icon: 'List', permission: 'ticket:read' }
            ]
        },
        {
            name: '系统管理', path: '/admin', component: 'Layout', icon: 'Setting', sort: 99, permission: 'system:admin',
            children: [
                { name: '用户管理', path: '/admin/users', component: 'admin/UserList', icon: 'User', permission: 'user:read' },
                { name: '角色管理', path: '/admin/roles', component: 'admin/RoleList', icon: 'Lock', permission: 'user:read' },
                { name: '菜单管理', path: '/admin/menus', component: 'admin/MenuList', icon: 'Menu', permission: 'system:admin' },
                { name: '项目管理', path: '/admin/projects', component: 'admin/ProjectList', icon: 'Folder', permission: 'project:read' }
            ]
        }
    ];

    for (const m of menus) {
        // Upsert Root
        // Using path as unique-ish identifier for finding existing to update would be good
        // But for now let's just create if clean DB.

        // We can try to find first
        let root = await prisma.menu.findFirst({ where: { path: m.path, parentId: null } });
        if (!root) {
            root = await prisma.menu.create({
                data: {
                    name: m.name, path: m.path, component: m.component, icon: m.icon, sort: m.sort, permission: m.permission
                }
            });
        }

        if (m.children) {
            for (const c of m.children) {
                let child = await prisma.menu.findFirst({ where: { path: c.path, parentId: root.id } });
                if (!child) {
                    await prisma.menu.create({
                        data: {
                            name: c.name, path: c.path, component: c.component, icon: c.icon, permission: c.permission, parentId: root.id
                        }
                    });
                }
            }
        }
    }
    console.log('Menus seeded.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

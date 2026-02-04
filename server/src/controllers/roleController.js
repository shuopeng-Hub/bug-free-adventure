const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getRoles = async (req, res) => {
    try {
        const roles = await prisma.role.findMany({
            include: {
                permissions: {
                    include: { permission: true }
                },
                menus: {
                    include: { menu: true }
                }
            }
        });

        // Flatten permissions for easier frontend consumption
        const formatted = roles.map(r => ({
            id: r.id,
            name: r.name,
            displayName: r.displayName,
            description: r.description,
            perms: r.permissions.map(rp => rp.permission.code),
            menus: r.menus.map(rm => rm.menuId) // Return array of menu IDs used for echoing
        }));

        res.json(formatted);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllPermissions = async (req, res) => {
    try {
        const perms = await prisma.permission.findMany();
        res.json(perms);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createRole = async (req, res) => {
    try {
        const { name, displayName, description } = req.body;
        const role = await prisma.role.create({
            data: { name, displayName, description }
        });
        res.status(201).json(role);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateRoleMenus = async (req, res) => {
    try {
        const { id } = req.params;
        const { menuIds } = req.body; // Array of menu IDs

        await prisma.roleMenu.deleteMany({
            where: { roleId: parseInt(id) }
        });

        for (const menuId of menuIds) {
            await prisma.roleMenu.create({
                data: {
                    roleId: parseInt(id),
                    menuId: parseInt(menuId)
                }
            });
        }
        res.json({ message: 'Menus updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update Role Permissions
exports.updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { perms } = req.body; // Array of permission codes

        // 1. Clear existing permissions
        await prisma.rolePermission.deleteMany({
            where: { roleId: parseInt(id) }
        });

        // 2. Find internal IDs for these codes
        const permissionRecords = await prisma.permission.findMany({
            where: { code: { in: perms } }
        });

        // 3. Insert new relations
        for (const p of permissionRecords) {
            await prisma.rolePermission.create({
                data: {
                    roleId: parseInt(id),
                    permissionId: p.id
                }
            });
        }

        res.json({ message: 'Permissions updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

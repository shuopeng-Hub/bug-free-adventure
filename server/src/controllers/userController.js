const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            include: {
                roles: {
                    include: { role: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Flatten for frontend compatibility
        const formattedUsers = users.map(u => ({
            id: u.id,
            username: u.username,
            name: u.name,
            email: u.email,
            department: u.department,
            status: u.status,
            createdAt: u.createdAt,
            role: u.roles.length > 0 ? u.roles[0].role.name : 'Guest', // Display main role
            roles: u.roles.map(r => r.role.name) // Full list
        }));

        res.json(formattedUsers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // Active, Rejected

        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { status }
        });

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        const { username, password, name, email, department, roleName } = req.body;
        const bcrypt = require('bcryptjs'); // Require locally or move top

        const existingUser = await prisma.user.findUnique({ where: { username } });
        if (existingUser) return res.status(400).json({ error: 'Username exists' });

        const hashedPassword = await bcrypt.hash(password, 10);

        // Find role
        // For UI simplicity we take roleName string
        const role = await prisma.role.findUnique({ where: { name: roleName || 'Reporter' } }); // Default to Reporter

        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                name,
                email,
                department,
                status: 'Active',
                roles: role ? {
                    create: { roleId: role.id }
                } : undefined
            }
        });
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.assignRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { roleName } = req.body;

        // We assume single role for simplicity in this MVP upgrade UI
        // But backend seed supports multiple. Let's find the role first.
        const role = await prisma.role.findUnique({ where: { name: roleName } });
        if (!role) return res.status(404).json({ error: 'Role not found' });

        // Wipe old roles (assuming single role UI)
        await prisma.userRole.deleteMany({ where: { userId: parseInt(id) } });

        await prisma.userRole.create({
            data: {
                userId: parseInt(id),
                roleId: role.id
            }
        });

        res.json({ message: 'Role assigned' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

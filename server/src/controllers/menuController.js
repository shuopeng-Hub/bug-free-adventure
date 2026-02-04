const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper to build tree
const buildMenuTree = (menus, parentId = null) => {
    return menus
        .filter(m => m.parentId === parentId)
        .map(m => ({
            ...m,
            children: buildMenuTree(menus, m.id)
        }))
        .sort((a, b) => a.sort - b.sort);
};

exports.getMenus = async (req, res) => {
    try {
        // TODO: Filter based on RoleMenu if strict mode
        const allMenus = await prisma.menu.findMany();
        const tree = buildMenuTree(allMenus);
        res.json(tree);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllMenusFlat = async (req, res) => {
    try {
        const menus = await prisma.menu.findMany({ orderBy: { sort: 'asc' } });
        res.json(menus);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.createMenu = async (req, res) => {
    try {
        const { name, path, component, icon, permission, sort, parentId, type } = req.body;
        const menu = await prisma.menu.create({
            data: {
                name, path, component, icon, permission, sort, type, // Added type
                parentId
            }
        });
        res.status(201).json(menu);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.updateMenu = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, path, component, icon, permission, sort, parentId, type } = req.body;
        const menu = await prisma.menu.update({
            where: { id: parseInt(id) },
            data: {
                name, path, component, icon, permission, sort, type,
                parentId
            }
        });
        res.json(menu);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.deleteMenu = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.menu.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

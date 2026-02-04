const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

exports.register = async (req, res) => {
    try {
        const { username, password, name, email, department } = req.body;

        // 检查用户是否存在
        const existingUser = await prisma.user.findUnique({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // 查找默认角色 (Reporter)
        const defaultRole = await prisma.role.findUnique({ where: { name: 'Reporter' } });

        // 创建用户
        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                name,
                email,
                department,
                status: 'Active',
                roles: defaultRole ? {
                    create: { roleId: defaultRole.id }
                } : undefined
            }
        });

        res.status(201).json({ message: 'User registered successfully.', userId: user.id });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 查找用户及其角色和权限
        const user = await prisma.user.findUnique({
            where: { username },
            include: {
                roles: {
                    include: {
                        role: {
                            include: {
                                permissions: {
                                    include: { permission: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!user) {
            return res.status(400).json({ message: '用户名或密码错误' });
        }

        if (user.status !== 'Active') {
            return res.status(403).json({ message: `账号状态异常: ${user.status}` });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: '用户名或密码错误' });
        }

        // 收集权限
        const permissions = new Set();
        const rolesList = [];
        if (user.roles) {
            user.roles.forEach(ur => {
                rolesList.push(ur.role.name);
                if (ur.role.permissions) {
                    ur.role.permissions.forEach(rp => {
                        permissions.add(rp.permission.code);
                    });
                }
            });
        }

        const token = jwt.sign(
            { userId: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // 根据角色获取菜单
        // 1. 获取用户角色分配的所有菜单ID
        const roleIds = user.roles.map(ur => ur.roleId);

        // 如果是管理员，可能获取所有？让我们坚持RBAC严格性 or 显式管理员检查。
        // 目前，我们获取链接到角色的菜单。
        // 注意：管理员角色应该在数据库中分配所有菜单才能正常工作，或者我们要在这里绕过。
        // 让我们做严格的 RBAC：菜单必须被分配。

        let visibleMenus = [];
        if (roleIds.length > 0) {
            // 查找 RoleMenu.menuId 和 roleId 匹配的菜单
            // Prisma 不像 raw 那样容易支持在 findMany 中进行 M-N 隐式连接过滤
            // 让我们使用 where: { roles: { some: { roleId: { in: roleIds } } } }
            visibleMenus = await prisma.menu.findMany({
                where: {
                    roles: {
                        some: {
                            roleId: { in: roleIds }
                        }
                    },
                    visible: true
                },
                orderBy: { sort: 'asc' }
            });
        }

        // 构建树
        const buildTree = (items, parentId = null) => {
            return items
                .filter(item => item.parentId === parentId)
                .map(item => ({
                    ...item,
                    children: buildTree(items, item.id)
                }));
        };
        const menuTree = buildTree(visibleMenus);

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                role: rolesList.length > 0 ? rolesList[0] : 'Guest',
                roles: rolesList,
                permissions: Array.from(permissions),
                menus: menuTree // 返回动态菜单树
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.logout = async (req, res) => {
    // 因为我们使用 JWT，如果没有黑名单，我们无法真正使令牌失效。
    // 但是我们可以返回成功消息供前端显示。
    res.json({ message: '退出登录成功' });
};

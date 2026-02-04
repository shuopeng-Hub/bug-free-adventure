const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const dayjs = require('dayjs');

exports.getStats = async (req, res) => {
    try {
        // 1. Basic Counts
        const openCount = await prisma.ticket.count({ where: { status: 'Open' } });
        const processingCount = await prisma.ticket.count({ where: { status: 'Processing' } });

        // Closed this week
        const startOfWeek = dayjs().startOf('week').toDate();
        const closedCount = await prisma.ticket.count({
            where: {
                status: 'Close',
                updatedAt: { gte: startOfWeek }
            }
        });

        // 2. Chart Data: Tickets per Project
        const ticketsPerProject = await prisma.ticket.groupBy({
            by: ['projectId'],
            _count: {
                id: true
            }
        });

        // We need project names, so let's fetch projects and map them
        const projects = await prisma.project.findMany();
        const projectMap = {};
        projects.forEach(p => projectMap[p.id] = p.name);

        const chartData = {
            categories: [],
            data: []
        };

        // If no tickets, provide some default mock structure or empty
        if (projects.length > 0) {
            projects.forEach(p => {
                const found = ticketsPerProject.find(t => t.projectId === p.id);
                chartData.categories.push(p.name);
                chartData.data.push(found ? found._count.id : 0);
            });
        }

        res.json({
            stats: {
                open: openCount,
                processing: processingCount,
                closedThisWeek: closedCount,
                avgResponseTime: 2.4 // Mock for now
            },
            chart: chartData
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getTickets = async (req, res) => {
    try {
        const { status, priority, projectId } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (priority) filter.priority = priority;
        if (projectId) filter.projectId = parseInt(projectId);

        const tickets = await prisma.ticket.findMany({
            where: filter,
            include: {
                project: true,
                submitter: { select: { name: true } },
                handler: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getTicketById = async (req, res) => {
    try {
        const { id } = req.params;
        const ticket = await prisma.ticket.findUnique({
            where: { id: parseInt(id) },
            include: {
                project: true,
                submitter: { select: { name: true } },
                handler: { select: { name: true } },
                logs: {
                    include: { operator: { select: { name: true } } },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
        res.json(ticket);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.createTicket = async (req, res) => {
    try {
        const { title, description, priority, projectId } = req.body;
        const userId = req.user.id; // From authMiddleware

        const ticket = await prisma.ticket.create({
            data: {
                title,
                description,
                priority,
                projectId: parseInt(projectId),
                submitterId: userId
            }
        });

        // Create Log
        await prisma.ticketLog.create({
            data: {
                ticketId: ticket.id,
                operatorId: userId,
                action: 'Created',
                details: 'Ticket created'
            }
        });

        res.status(201).json(ticket);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateTicketStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, comment } = req.body;
        const userId = req.user.id;

        const ticket = await prisma.ticket.update({
            where: { id: parseInt(id) },
            data: {
                status,
                handlerId: status === 'Processing' ? userId : undefined // Assign to self if processing
            }
        });

        // Create Log
        await prisma.ticketLog.create({
            data: {
                ticketId: ticket.id,
                operatorId: userId,
                action: 'Status Changed',
                details: `Status changed to ${status}. Comment: ${comment || 'No comment'}`
            }
        });

        res.json(ticket);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

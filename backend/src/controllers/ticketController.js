const getTickets = async (req, res) => {
  try {
    if (req.isSuperAdmin) {
      return res.json([]);
    }
    const prisma = req.tenantDb;
    const { status, priority, search, projectId } = req.query;
    let where = {};

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (projectId) where.projectId = parseInt(projectId);
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { ticketId: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (req.user.role.name === 'EMPLOYEE') {
      where.assignedTo = req.user.id;
    } else if (req.user.role.name === 'MANAGER') {
      where.OR = [
        { managedBy: req.user.id },
        { assignedTo: req.user.id }
      ];
    }

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        project: true,
        assignedToUser: true,
        managedByUser: true,
        createdByUser: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(tickets);
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getTicketById = async (req, res) => {
  try {
    const prisma = req.tenantDb;
    const ticket = await prisma.ticket.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        project: true,
        assignedToUser: true,
        managedByUser: true,
        createdByUser: true,
        comments: { include: { user: true } },
        attachments: { include: { user: true } },
        history: { include: { user: true } }
      }
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Get ticket by id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createTicket = async (req, res) => {
  try {
    const prisma = req.tenantDb;
    const { projectId, assignedTo, managedBy, emailSubject, basecampUrl, ...data } = req.body;
    const lastTicket = await prisma.ticket.findFirst({
      orderBy: { id: 'desc' }
    });
    const nextId = lastTicket ? parseInt(lastTicket.ticketId.split('-')[1]) + 1 : 1000;

    const ticket = await prisma.ticket.create({
      data: {
        ...data,
        ticketId: `TCKT-${nextId}`,
        projectId: parseInt(projectId),
        assignedTo: assignedTo ? parseInt(assignedTo) : null,
        managedBy: managedBy ? parseInt(managedBy) : null,
        emailSubject: emailSubject || null,
        basecampUrl: basecampUrl || null,
        createdBy: req.user.id
      },
      include: {
        project: true,
        assignedToUser: true,
        managedByUser: true,
        createdByUser: true
      }
    });

    await prisma.ticketHistory.create({
      data: {
        ticketId: ticket.id,
        userId: req.user.id,
        action: 'CREATED'
      }
    });

    res.status(201).json(ticket);
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateTicket = async (req, res) => {
  try {
    const prisma = req.tenantDb;
    const { projectId, assignedTo, managedBy, status, emailSubject, basecampUrl, ...data } = req.body;
    const updateData = { ...data, updatedAt: new Date() };

    if (projectId) updateData.projectId = parseInt(projectId);
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo ? parseInt(assignedTo) : null;
    if (managedBy !== undefined) updateData.managedBy = managedBy ? parseInt(managedBy) : null;
    if (emailSubject !== undefined) updateData.emailSubject = emailSubject || null;
    if (basecampUrl !== undefined) updateData.basecampUrl = basecampUrl || null;

    const existingTicket = await prisma.ticket.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!existingTicket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const ticket = await prisma.ticket.update({
      where: { id: existingTicket.id },
      data: updateData,
      include: {
        project: true,
        assignedToUser: true,
        managedByUser: true,
        createdByUser: true
      }
    });

    if (status && existingTicket.status !== status) {
      await prisma.ticketHistory.create({
        data: {
          ticketId: ticket.id,
          userId: req.user.id,
          action: 'STATUS_CHANGED',
          field: 'status',
          oldValue: existingTicket.status,
          newValue: status
        }
      });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteTicket = async (req, res) => {
  try {
    const prisma = req.tenantDb;
    await prisma.ticket.delete({
      where: { id: parseInt(req.params.id) }
    });

    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Delete ticket error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

const addComment = async (req, res) => {
  try {
    const prisma = req.tenantDb;
    const { content } = req.body;
    const ticket = await prisma.ticket.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const comment = await prisma.ticketComment.create({
      data: {
        ticketId: ticket.id,
        userId: req.user.id,
        content
      },
      include: { user: true }
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getTickets, getTicketById, createTicket, updateTicket, deleteTicket, addComment };

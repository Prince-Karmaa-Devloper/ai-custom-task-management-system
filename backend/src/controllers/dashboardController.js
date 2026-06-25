const emptyCharts = () => ({
  ticketsByStatus: [
    { name: 'Pending', value: 0 },
    { name: 'In Progress', value: 0 },
    { name: 'Completed', value: 0 },
    { name: 'Posted', value: 0 },
    { name: 'Reassigned', value: 0 }
  ],
  ticketsByPriority: [
    { name: 'Low', value: 0 },
    { name: 'Medium', value: 0 },
    { name: 'High', value: 0 },
    { name: 'Critical', value: 0 }
  ]
});

const getDashboardStats = async (req, res) => {
  try {
    if (req.isSuperAdmin) {
      const { getMainDb } = require('../config/dbManager');
      const prisma = getMainDb();
      
      const totalCompanies = await prisma.company.count({ where: { isActive: true } });
      const inactiveCompanies = await prisma.company.count({ where: { isActive: false } });

      return res.json({
        totalCompanies,
        inactiveCompanies,
        totalUsers: 0,
        totalManagers: 0,
        totalEmployees: 0,
        totalTickets: 0,
        completedTickets: 0,
        pendingTickets: 0,
        revenueMetrics: 125000
      });
    }

    const prisma = req.tenantDb;
    const role = req.user.role.name;

    const totalUsers = await prisma.user.count({ where: { isActive: true } });
    const totalProjects = await prisma.project.count();
    const totalTickets = await prisma.ticket.count();
    const completedTickets = await prisma.ticket.count({ where: { status: 'Completed' } });
    const pendingTickets = await prisma.ticket.count({ where: { status: 'Pending' } });

    let stats = {
      totalUsers,
      totalProjects,
      totalTickets,
      completedTickets,
      pendingTickets
    };

    if (role === 'ADMIN') {
      const managers = await prisma.user.count({
        where: { 
          isActive: true,
          role: { name: 'MANAGER' }
        }
      });
      const employees = await prisma.user.count({
        where: { 
          isActive: true,
          role: { name: 'EMPLOYEE' }
        }
      });
      stats = { ...stats, totalManagers: managers, totalEmployees: employees };
    } else if (role === 'MANAGER') {
      const teamMembers = await prisma.user.count({
        where: { parentId: req.user.id, isActive: true }
      });
      const assignedTickets = await prisma.ticket.count({
        where: { OR: [{ managedBy: req.user.id }, { assignedTo: req.user.id }] }
      });
      stats = { ...stats, teamMembers, assignedTickets };
    } else if (role === 'EMPLOYEE') {
      const assignedTickets = await prisma.ticket.count({
        where: { assignedTo: req.user.id }
      });
      stats = { ...stats, assignedTickets, aiProductivityScore: 85 };
    }

    res.json(stats);
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getDashboardCharts = async (req, res) => {
  try {
    if (req.isSuperAdmin) {
      return res.json(emptyCharts());
    }

    const prisma = req.tenantDb;
    const ticketsByStatus = await prisma.ticket.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    const ticketsByPriority = await prisma.ticket.groupBy({
      by: ['priority'],
      _count: { id: true }
    });

    const statusMap = {
      'Pending': 0,
      'In Progress': 0,
      'Completed': 0,
      'Posted': 0,
      'Reassigned': 0
    };

    const priorityMap = {
      'Low': 0,
      'Medium': 0,
      'High': 0,
      'Critical': 0
    };

    ticketsByStatus.forEach(item => {
      if (statusMap.hasOwnProperty(item.status)) {
        statusMap[item.status] = item._count.id;
      }
    });

    ticketsByPriority.forEach(item => {
      if (priorityMap.hasOwnProperty(item.priority)) {
        priorityMap[item.priority] = item._count.id;
      }
    });

    res.json({
      ticketsByStatus: Object.entries(statusMap).map(([name, value]) => ({ name, value })),
      ticketsByPriority: Object.entries(priorityMap).map(([name, value]) => ({ name, value }))
    });
  } catch (error) {
    console.error('Get dashboard charts error:', error);
    res.json(emptyCharts());
  }
};

module.exports = { getDashboardStats, getDashboardCharts };

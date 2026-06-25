const getProjects = async (req, res) => {
  try {
    if (req.isSuperAdmin) {
      return res.json([]);
    }
    const prisma = req.tenantDb;
    const projects = await prisma.project.findMany({
      include: { members: { include: { user: true } }, tickets: true, createdByUser: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getProjectById = async (req, res) => {
  try {
    const prisma = req.tenantDb;
    const project = await prisma.project.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { members: { include: { user: true } }, tickets: true, createdByUser: true }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Get project by id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createProject = async (req, res) => {
  try {
    const prisma = req.tenantDb;
    const project = await prisma.project.create({
      data: { ...req.body, createdBy: req.user.id },
      include: { members: { include: { user: true } }, createdByUser: true }
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateProject = async (req, res) => {
  try {
    const prisma = req.tenantDb;
    const project = await prisma.project.update({
      where: { id: parseInt(req.params.id) },
      data: { ...req.body, updatedAt: new Date() },
      include: { members: { include: { user: true } }, createdByUser: true }
    });

    res.json(project);
  } catch (error) {
    console.error('Update project error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteProject = async (req, res) => {
  try {
    const prisma = req.tenantDb;
    await prisma.project.delete({
      where: { id: parseInt(req.params.id) }
    });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getProjects, getProjectById, createProject, updateProject, deleteProject };

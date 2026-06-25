export const getCreatableRoles = (currentUserRole) => {
  switch (currentUserRole) {
    case 'superadmin':
      return ['admin', 'manager', 'employee'];
    case 'admin':
      return ['manager', 'employee'];
    case 'manager':
      return ['employee'];
    default:
      return [];
  }
};

const getManagersForAdmin = (allUsers, adminId) =>
  allUsers.filter((user) => {
    if (user.role !== 'manager') return false;
    if (user.parentId === adminId) return true;
    const parent = allUsers.find((u) => u.id === user.parentId);
    return parent?.parentId === adminId;
  });

export const getEligibleParents = (allUsers, currentUser, selectedRole) => {
  if (!currentUser || !selectedRole) return [];

  if (selectedRole === 'admin') {
    return allUsers.filter((user) => user.role === 'superadmin');
  }

  if (selectedRole === 'manager') {
    if (currentUser.role === 'superadmin') {
      return allUsers.filter((user) => user.role === 'admin');
    }
    if (currentUser.role === 'admin') {
      return [currentUser];
    }
    return [];
  }

  if (selectedRole === 'employee') {
    if (currentUser.role === 'superadmin') {
      return allUsers.filter((user) => user.role === 'manager');
    }
    if (currentUser.role === 'admin') {
      return getManagersForAdmin(allUsers, currentUser.id);
    }
    if (currentUser.role === 'manager') {
      return [currentUser];
    }
  }

  return [];
};

export const getDefaultParentId = (allUsers, currentUser, selectedRole) => {
  const parents = getEligibleParents(allUsers, currentUser, selectedRole);
  if (parents.length === 1) return parents[0].id;
  return '';
};

export const resolveTenantId = (allUsers, parentId, currentUser) => {
  if (parentId) {
    const parent = allUsers.find((user) => user.id === parentId);
    if (parent?.tenantId) return parent.tenantId;
  }
  return currentUser.tenantId || currentUser.tenantDomain || 'global';
};

export const getInitials = (name) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();

export const getHierarchyUsers = (currentUser, users) => {
  if (!users || users.length === 0) return [];
  
  // If super admin, return all users
  if (currentUser?.role === 'superadmin') {
    return [...users];
  }
  
  // For admin/manager/employee, return all users in the same tenant
  return users;
};

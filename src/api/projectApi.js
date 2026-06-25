import axios from 'axios';
import { getAllProjects, getProjectById } from '../data/projects';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const getProjects = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const projects = getAllProjects();
      resolve({ data: projects });
    }, 500);
  });
};

export const getProjectByIdApi = async (projectId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const project = getProjectById(projectId);
      resolve({ data: project });
    }, 300);
  });
};

export const createProject = async (projectData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: { success: true, project: { ...projectData, id: Date.now() } } });
    }, 500);
  });
};

export const updateProject = async (projectId, projectData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: { success: true, project: { ...projectData, id: projectId } } });
    }, 500);
  });
};

export const deleteProject = async (projectId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: { success: true } });
    }, 500);
  });
};

export default api;

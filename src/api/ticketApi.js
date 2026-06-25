import axios from 'axios';
import { getAllTickets, getTicketById } from '../data/tickets';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const getTickets = async (params = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const tickets = getAllTickets();
      resolve({ data: tickets, total: tickets.length });
    }, 500);
  });
};

export const getTicketById = async (ticketId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const ticket = getTicketById(ticketId);
      resolve({ data: ticket });
    }, 300);
  });
};

export const createTicket = async (ticketData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: { success: true, ticket: { ...ticketData, ticketId: `TCKT-${Date.now()}` } } });
    }, 500);
  });
};

export const updateTicket = async (ticketId, ticketData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: { success: true, ticket: { ...ticketData, ticketId } } });
    }, 500);
  });
};

export const deleteTicket = async (ticketId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: { success: true } });
    }, 500);
  });
};

export default api;

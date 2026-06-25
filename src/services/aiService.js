export const generateAISuggestion = async (ticket) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        suggestion: `Based on the ticket "${ticket.title}", here are my suggestions:\n1. Break down the task into smaller subtasks\n2. Prioritize the critical components first\n3. Collaborate with the design team for UI elements\n4. Write unit tests before implementation`
      });
    }, 1000);
  });
};

export const generateWorkflow = async (ticket) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        workflow: [
          { step: 1, title: 'Analysis', description: 'Analyze requirements and create technical specification' },
          { step: 2, title: 'Design', description: 'Create wireframes and design mockups' },
          { step: 3, title: 'Development', description: 'Implement the feature with clean code' },
          { step: 4, title: 'Testing', description: 'Write unit and integration tests' },
          { step: 5, title: 'Review', description: 'Code review and QA testing' },
          { step: 6, title: 'Deployment', description: 'Deploy to production' }
        ]
      });
    }, 1200);
  });
};

export const generateReport = async (ticket) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        report: `Task Report: ${ticket.title}\n\nCurrent Status: ${ticket.status}\nPriority: ${ticket.priority}\nEstimated Hours: ${ticket.estimatedHours}\nAI Score: ${ticket.aiScore}/100\n\nRecommendations:\n- The task is on track\n- Consider reallocating resources if needed\n- Monitor progress daily`
      });
    }, 1500);
  });
};

export const getTaskGuidance = async (query) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        guidance: `Here's guidance for: "${query}"\n\n1. Start with understanding the requirements clearly\n2. Break the task into manageable chunks\n3. Set clear milestones and deadlines\n4. Communicate progress regularly\n5. Don't hesitate to ask for help when stuck`
      });
    }, 800);
  });
};

export const getWorkflowRecommendation = async (projectType) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        recommendation: `For a ${projectType} project, we recommend:\n- Agile methodology with 2-week sprints\n- Daily standup meetings\n- Continuous integration and deployment\n- Regular stakeholder reviews`
      });
    }, 1000);
  });
};

export const improveWriting = async (text) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        improved: `[Improved version] ${text}\n\nSuggestions:\n- Use active voice\n- Keep sentences concise\n- Add more specific details`
      });
    }, 800);
  });
};

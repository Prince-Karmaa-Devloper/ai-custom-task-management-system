export const extractTaskFromMessage = async (message) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        task: {
          title: 'Extracted Task from Message',
          description: message,
          priority: 'Medium',
          estimatedHours: 8
        }
      });
    }, 1500);
  });
};

export const generateWorkflow = async (task) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        workflow: [
          { id: 1, name: 'Requirement Analysis', duration: '2h' },
          { id: 2, name: 'Design', duration: '4h' },
          { id: 3, name: 'Implementation', duration: '8h' },
          { id: 4, name: 'Testing', duration: '3h' },
          { id: 5, name: 'Deployment', duration: '1h' }
        ]
      });
    }, 2000);
  });
};

export const estimateTaskTime = async (taskDescription) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        estimatedHours: Math.floor(Math.random() * 40) + 5,
        confidence: 85
      });
    }, 1000);
  });
};

export const improveWriting = async (text) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        improvedText: `[Enhanced by Local LLM] ${text}`,
        suggestions: ['Clarity improved', 'Tone adjusted', 'Structure optimized']
      });
    }, 1200);
  });
};

export const generatePerformanceReport = async (userId, dateRange) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        userId,
        dateRange,
        metrics: {
          completedTasks: Math.floor(Math.random() * 20) + 5,
          avgCompletionTime: `${Math.floor(Math.random() * 8) + 2}h`,
          productivityScore: Math.floor(Math.random() * 100),
          tasksOnTime: Math.floor(Math.random() * 100)
        }
      });
    }, 1800);
  });
};

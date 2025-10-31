
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProjectView from '../components/ProjectView';
import LoginForm from '../components/LoginForm';
import { ThemeProvider } from '../contexts/ThemeContext';
import { Ticket } from '../components/Dashboard';

interface User {
  id: string;
  email: string;
  name: string;
  type: 'admin' | 'client';
  projects: string[];
}

// Mock ticket data
const mockTickets: Ticket[] = [
  {
    id: '1',
    title: 'Login page not loading properly',
    description: 'The login page takes too long to load and sometimes shows a blank screen.',
    status: 'in-progress',
    priority: 'high',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T14:20:00Z',
    project: 'Project Management System',
    module: 'ui',
    messages: [
      {
        id: '1',
        content: 'The login page takes too long to load and sometimes shows a blank screen.',
        author: 'John Smith',
        isClient: true,
        timestamp: '2024-01-15T10:30:00Z'
      }
    ]
  }
];

const ProjectPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const { projectName } = useParams<{ projectName: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  const handleBack = () => {
    if (user?.type === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  const getProjectTickets = (project: string) => {
    return mockTickets.filter(ticket => ticket.project === project);
  };

  if (!projectName) {
    navigate('/');
    return null;
  }

  const decodedProjectName = decodeURIComponent(projectName);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        {!user ? (
          <LoginForm onLogin={handleLogin} />
        ) : (
          <ProjectView
            project={decodedProjectName}
            user={user}
            tickets={getProjectTickets(decodedProjectName)}
            onBack={handleBack}
            onLogout={handleLogout}
          />
        )}
      </div>
    </ThemeProvider>
  );
};

export default ProjectPage;

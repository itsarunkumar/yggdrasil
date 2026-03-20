import { createContext, useContext, useState, useCallback } from 'react';
import { fetchPublicEvents } from '../services/githubApi';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [repoQuery, setRepoQuery] = useState('');
  const [hoveredNode, setHoveredNode] = useState(null);

  const loadData = useCallback(async (repo = null) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPublicEvents(repo || null);
      setTreeData(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AppContext.Provider value={{
      treeData, loading, error, repoQuery,
      setRepoQuery, loadData, hoveredNode, setHoveredNode,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}

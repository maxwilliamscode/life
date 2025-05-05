import { useEffect } from 'react';
import { checkDatabaseTables } from '@/lib/database/setupDatabase';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    const initDatabase = async () => {
      await checkDatabaseTables();
    };
    initDatabase();
  }, []);

  return (
    <div>
      {children}
    </div>
  );
};

export default AdminLayout;
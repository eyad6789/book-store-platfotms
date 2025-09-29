import { useParams } from 'react-router-dom';
import LibraryDashboard from './LibraryDashboard';

function LibraryDashboardWrapper() {
  const { bookstoreId } = useParams();
  
  return <LibraryDashboard bookstoreId={bookstoreId} />;
}

export default LibraryDashboardWrapper;

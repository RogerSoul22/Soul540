import { Outlet } from 'react-router-dom';
import { ApiFeedback, PortalLayout } from '@soul540/ui';
import Sidebar from '../Sidebar/Sidebar';

export default function Layout() {
  return (
    <PortalLayout feedback={<ApiFeedback />} renderSidebar={(props) => <Sidebar {...props} />}>
      <Outlet />
    </PortalLayout>
  );
}

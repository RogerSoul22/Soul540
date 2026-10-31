import { Outlet } from 'react-router-dom';
import { PortalLayout } from '../../../../../packages/ui/src/index';
import { ApiFeedback } from '../../../../../packages/ui/src/index';
import Sidebar from '../Sidebar/Sidebar';

export default function Layout() {
  return (
    <PortalLayout feedback={<ApiFeedback />} renderSidebar={(props) => <Sidebar {...props} />}>
      <Outlet />
    </PortalLayout>
  );
}

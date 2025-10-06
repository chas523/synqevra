import './index.css';
import { Helmet } from '@modern-js/runtime/head';
import { Outlet } from '@modern-js/runtime/router';
import AppSwitch from '../components/AppSwitch';

export default function Layout() {
  return (
    <div className="min-h-screen relative bg-gray-50">
      <Helmet>
        <link
          rel="icon"
          type="image/x-icon"
          href="https://lf3-static.bytednsdoc.com/obj/eden-cn/uhbfnupenuhf/favicon.ico"
        />
      </Helmet>
      
      <AppSwitch />
      
      <Outlet />
    </div>
  );
}

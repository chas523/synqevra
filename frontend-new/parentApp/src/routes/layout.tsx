import './index.css';
import { Helmet } from '@modern-js/runtime/head';
import SidebarLayout from '@/components/SidebarLayout';

export default function Layout() {
  return (
    <>
      <Helmet>
        <link
          rel="icon"
          type="image/x-icon"
          href="https://lf3-static.bytednsdoc.com/obj/eden-cn/uhbfnupenuhf/favicon.ico"
        />
      </Helmet>
      <SidebarLayout />
    </>
  );
}

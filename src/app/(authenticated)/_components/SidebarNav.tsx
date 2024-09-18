import Image from 'next/image';
import NavLinks from './NavLinks';
import Profile from './Profile';

const SidebarNav = () => {
  return (
    <>
      <Image
        src={'/static/images/logo.png'}
        width={176}
        height={45}
        alt="logo"
        priority
        draggable="false"
        className="mb-4"
      />
      <Profile />
      <NavLinks />
    </>
  );
};

export default SidebarNav;

import Image from 'next/image';

const Footer = () => {
  return (
    <div className="w-full flex flex-col items-center mt-24 py-4">
      <Image
        src={'/static/images/logo.png'}
        width={176}
        height={45}
        alt="logo"
        draggable="false"
      />
      <p className="text-stone-600 text-sm mt-4">
        &copy; 2024 Budgeteer by{' '}
        <a
          href="https://github.com/hajdupetke"
          target="_blank"
          className="underline"
        >
          Hajdu Péter
        </a>
      </p>
    </div>
  );
};

export default Footer;

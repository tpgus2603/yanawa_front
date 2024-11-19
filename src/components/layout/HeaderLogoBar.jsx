import LogoIcon from "../icons/LogoIcon";

const HeaderLogoBar = () => {
  return (
    <div className="flex items-center justify-start w-full h-16 px-4 bg-white">
      <div className="flex items-center">
        <LogoIcon width={32} height={32} />
        <span className="title-1">YANAWA</span>
      </div>
    </div>
  );
};

export default HeaderLogoBar;

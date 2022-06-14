import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { IconContext } from "react-icons";
import {
  BsCaretDownFill,
  BsCaretUpFill,
  BsChevronDown,
  BsChevronUp,
} from "react-icons/bs";
export type SidebarItemProps = {
  active?: boolean;
  href?: string;
  icon: any;
  size?: number;
  onClick?: () => void;
  disabled?: boolean;
  label: string;
  children?: any;
};

const RawSideBarLinkItem: React.FC<SidebarItemProps> = ({
  label = "Inventory",
  href = "/",
  disabled = false,
  active = false,
  icon,
  size = 18,
  children,
  ...props
}) => {
  const router = useRouter();
  let isActive = router.pathname.includes(href) && href !== "/";
  if (href == "/" && href == router.pathname) {
    isActive = true;
  }
  const [toggle, setToggle] = useState(false);
  const mode = isActive ? "text-white bg-blue-600" : "text-neutral-400";
  const toggleMode = toggle
    ? "cursor-pointer text-white font-bold"
    : "transition my-3 duration-200 ease-in cursor-pointer text-neutral-400 font-bold";
  return (
    <div >
      <a
        {...props}
        className={`${mode} p-3 transition duration-150 ease-linear cursor-pointer hover:text-blue-400 flex flex-row items-center w-full gap-3 text-sm font-semibold`}
      >
        {isActive ? (
          <div className="bg-zinc-500 transition duration-200 ease-in bg-blue-50 p-3 rounded-full">
            <IconContext.Provider
              value={{
                className: "cursor-pointer text-white",
                size: `${size}`,
              }}
            >
              {icon}
            </IconContext.Provider>
          </div>
        ) : (
          <IconContext.Provider
            value={{
              className:
                "transition my-3 duration-200 ease-in mx-3 cursor-pointer text-neutral-500",
              size: `24`,
            }}
          >
            {icon}
          </IconContext.Provider>
        )}

        <div
          onClick={() => setToggle(!toggle)}
          className="flex items-center justify-between w-full  "
        >
          <p>{label} </p>
          {children ? (
            Array.isArray(children) ? (
              children.length > 0 ? (
                toggle ? (
                  <BsCaretDownFill className={toggleMode} size={12} />
                ) : (
                  <BsCaretUpFill className={toggleMode} size={12} />
                )
              ) : null
            ) : null
          ) : null}
        </div>
      </a>
      {children ? (
        toggle ? (
          Array.isArray(children) ? (
            children.length > 0 ? (
              <ul className="bg-zinc-900 h-full overflow-y-auto  pt-5 flex flex-col gap-6 pl-4 ">
                {children.map((link, index) => {
                  return <SidebarLinkItem key={link.href} {...link} />;
                })}
              </ul>
            ) : null
          ) : null
        ) : null
      ) : null}
    </div>
  );
};

const SidebarLinkItem = ({ href, disabled, ...props }: SidebarItemProps) => {
  if (disabled) {
    return <RawSideBarLinkItem href={href} {...props} />;
  } else
    return (
      <Link href={href}>
        <RawSideBarLinkItem href={href} {...props} />
      </Link>
    );
};

export default SidebarLinkItem;

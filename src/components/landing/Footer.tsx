import Link from "next/link";
import Image from "next/image";
import Section from "@/components/landing/Section";

const legalLinks = [
  {
    id: "terms",
    label: "Terms",
    href: "/legal/terms",
  },
  {
    id: "privacy",
    label: "Privacy Policy",
    href: "/legal/privacy",
  },
  {
    id: "cookies",
    label: "Cookie Policy",
    href: "/legal/cookies",
  },
];

const Footer = () => {
  return (
    <Section
      crosses
      crossesOffset=""
      customPaddings="py-0"
      id="footer"
      className="flex-grow-0"
    >
      <div>
        <div className="pt-4">
          <div className="flex justify-center">
            <Image
              priority
              alt="NepLoom Abstract Logo"
              src={"/NepLoomRed.svg"}
              width={144}
              height={144}
              className="h-36 w-36"
              placeholder="blur"
              blurDataURL="/NepLoomRed.svg"
            />
          </div>
        </div>
      </div>
      <div className="py-10 md:flex md:items-center md:justify-between">
        <div className="text-center md:text-left">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            &copy; {new Date().getFullYear()} All Rights Reserved
          </p>
        </div>{" "}
        <div className="mt-4 flex items-center justify-center md:mt-0">
          <div className="flex space-x-8">
            {" "}
            {legalLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 rounded-sm"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
};

export default Footer;

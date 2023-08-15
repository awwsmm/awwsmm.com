import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';

export default function PageHeader({ isHomePage }: { isHomePage?: boolean }) {
  const title = 'Andrew Watson';

  const portrait = (
    <Image
      priority
      src="/images/profile.png"
      className="page-header-image"
      height={isHomePage ? 144 : 108}
      width={isHomePage ? 144 : 108}
      alt={title}
    />
  );

  useEffect(() => {
    const defaultTheme = 'dark';

    const currentTheme = localStorage.getItem('theme') ?? defaultTheme;
    document.documentElement.setAttribute('data-theme', currentTheme);

    const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]') as Element;
    const switchLegend = document.getElementById('theme-switch-legend') as Element;

    toggleSwitch.checked = currentTheme === 'light';

    function lightMode() {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
      switchLegend.innerHTML = 'light mode';
    }

    function darkMode() {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      switchLegend.innerHTML = 'dark mode';
    }

    function switchTheme(e: Event) {
      if (e.target?.checked) {
        lightMode();
      } else {
        darkMode();
      }
    }

    currentTheme == 'light' ? lightMode() : darkMode();

    toggleSwitch.addEventListener('change', switchTheme, false);
  });

  return (
    <>
      <header className="page-header-container">
        {isHomePage ? portrait : <Link href="/">{portrait}</Link>}
        {isHomePage ? (
          <h1 className="page-header-my-name-home">{title}</h1>
        ) : (
          <Link href="/" className="page-header-my-name">
            {title}
          </Link>
        )}
        <div className="theme-switch-wrapper">
          <label className="theme-switch">
            <input type="checkbox" id="checkbox" />
            <div className="slider round"></div>
          </label>
          <div id="theme-switch-legend"></div>
        </div>
      </header>
    </>
  );
}

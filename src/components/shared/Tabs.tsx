'use client';

import Icon from '@/components/shared/Icon';
import { TabProps } from '@/types';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { useCallback } from 'react';

type Props = {
  tabs: Record<string, TabProps>;
  route: string;
  replace?: boolean;
};

export default function Tabs({ tabs, route, replace }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { tab } = useParams();
  const normalizedTabs = Object.entries(tabs).map(([key, value], index) => {
    return {
      label: value.label,
      value: index !== 0 ? key : undefined,
      icon: value.icon || null,
    };
  });

  // Get current tab from URL params
  const currentTab = (tab as string) || normalizedTabs[0].value;

  // Handle tab click
  const handleTabClick = useCallback(
    (tabValue: string | undefined) => {
      const url = `${route}${tabValue ? `/${tabValue}` : ''}`;

      if (replace) {
        router.replace(url);
      } else {
        router.push(url);
      }
    },
    [router, pathname, tab, replace]
  );

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <nav className="flex" aria-label="Tabs">
        {normalizedTabs.map((tab) => {
          const isActive = currentTab === tab.value;

          return (
            <button
              key={tab.label}
              type="button"
              className={`group relative inline-flex items-center gap-2 py-3 px-4 border-b-2 hover:cursor-pointer font-medium text-sm transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                isActive
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'
              }`}
              onClick={() => handleTabClick(tab.value)}
              aria-current={isActive ? 'page' : undefined}
            >
              {tab.icon && (
                <Icon
                  iconName={tab.icon}
                  className={`h-4 w-4 transition-colors duration-200 ease-in-out ${
                    isActive
                      ? 'text-blue-500 dark:text-blue-400'
                      : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                  }`}
                />
              )}
              {tab.label}

              {/* Active indicator */}
              {isActive && (
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-500 dark:bg-blue-400 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

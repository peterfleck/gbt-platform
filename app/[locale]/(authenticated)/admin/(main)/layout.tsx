import { ReactNode } from 'react';
import { SidebarLink } from "@/app/components/NavLink";
import { Icon } from '@/app/components/Icon';
import { useTranslations } from 'next-intl';

export interface AdminLayoutProps {
    children?: ReactNode
    params: { locale: string }
}

export default function AdminLayout({ children, params }: AdminLayoutProps) {
    const t = useTranslations("AdminLayout")

    return (
    <div className="absolute w-full h-full flex items-stretch">
      <div className="min-w-[280px] flex-shrink-0 bg-brown-100 dark:bg-gray-700 p-6 pt-7">
        <div className="px-3 mb-4">
          <h2 className="font-bold text-lg">{t('title')}</h2>
        </div>
        <ul>
          <li>
            <SidebarLink href={`/${params.locale}/admin/languages`}>
              <Icon icon="language" className="w-4 me-2" />
              {t('links.languages')}
            </SidebarLink>
          </li>
          <li>
            <SidebarLink href={`/${params.locale}/admin/users`}>
              <Icon icon="user" className="w-4 me-2" />
              {t('links.users')}
            </SidebarLink>
          </li>
        </ul>
      </div>
      <div className="flex-grow">
        {children}
      </div>
    </div>
  );

}

import {
  Bell,
  ClipboardList,
  Heart,
  Home,
  MapPin,
  RotateCcw,
  Star,
  UserRound,
  CalendarDays,
  LogOut,
} from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import http from '../api/http';

const links = [
  ['/account', 'Dashboard', Home, true],
  ['/account/profile', 'Profile', UserRound],
  ['/account/orders', 'Orders', ClipboardList],
  ['/account/prescriptions', 'Prescriptions', ClipboardList],
  ['/account/wishlist', 'Wishlist', Heart],
  ['/account/addresses', 'Addresses', MapPin],
  ['/account/reviews', 'Reviews', Star],
  ['/account/returns', 'Returns', RotateCcw],
  ['/account/bookings', 'Bookings', CalendarDays],
  ['/account/notifications', 'Notifications', Bell],
];

export default function Account() {
  const user = useAuthStore((state) => state.user);
  const logoutLocal = useAuthStore((state) => state.logoutLocal);

  const handleLogout = async () => {
    try {
      await http.post('/auth/logout');
    } catch (error) {
      // Even if the API logout request fails, clear the local session.
      console.error('Logout request failed:', error);
    } finally {
      logoutLocal();
      window.location.href = '/';
    }
  };

  return (
    <main className="container-app py-10">
      <div className="grid gap-7 lg:grid-cols-[250px_1fr]">
        <aside className="card h-fit p-4">
          <div className="border-b p-3">
            <div className="text-xs text-slate-500">Signed in as</div>
            <div className="font-black">{user?.firstName || 'Customer'}</div>
          </div>

          <nav className="mt-3 space-y-1">
            {links.map(([to, label, Icon, end]) => (
              <NavLink
                end={Boolean(end)}
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition ${isActive
                    ? 'bg-brand-600 text-white'
                    : 'hover:bg-brand-50 hover:text-brand-700'
                  }`
                }
              >
                <Icon size={17} />
                {label}
              </NavLink>
            ))}

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-red-600 hover:bg-red-50"
            >
              <LogOut size={17} />
              Logout
            </button>
          </nav>
        </aside>

        <section className="min-w-0">
          <Outlet />
        </section>
      </div>
    </main>
  );
}

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import {
  ArrowRightOnRectangleIcon,
  TruckIcon,
  UserIcon
} from '@heroicons/react/24/outline';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center shadow-md group-hover:scale-105 transition">
              <TruckIcon className="w-6 h-6 text-white" />
            </div>

            <div>
              <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
                Rydex
              </h1>
              <p className="text-[10px] text-gray-500 -mt-1">
                Ride • Share • Save
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {user ? (
              <>
                <Link
                  to="/post-ride"
                  className="font-medium text-gray-700 hover:text-primary-600 transition-colors"
                >
                  Post a Ride
                </Link>

                <Link
                  to="/my-rides"
                  className="font-medium text-gray-700 hover:text-primary-600 transition-colors"
                >
                  My Rides
                </Link>

                <Link
                  to="/my-bookings"
                  className="font-medium text-gray-700 hover:text-primary-600 transition-colors"
                >
                  My Bookings
                </Link>

                {/* User Menu */}
                <Menu as="div" className="relative">
                  <Menu.Button className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-full transition-all">
                    <img
                      src={user.profilePhoto || '/default-avatar.png'}
                      alt={user.name}
                      className="w-9 h-9 rounded-full object-cover border-2 border-primary-100"
                    />

                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-800">
                        {user.name.split(' ')[0]}
                      </p>
                    </div>
                  </Menu.Button>

                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-150"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 overflow-hidden">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/profile"
                            className={`${
                              active ? 'bg-primary-50 text-primary-600' : ''
                            } flex items-center gap-3 px-4 py-3 text-gray-700 transition`}
                          >
                            <UserIcon className="w-5 h-5" />
                            Profile
                          </Link>
                        )}
                      </Menu.Item>

                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={logout}
                            className={`${
                              active ? 'bg-red-50 text-red-600' : ''
                            } flex items-center gap-3 px-4 py-3 text-gray-700 w-full text-left transition`}
                          >
                            <ArrowRightOnRectangleIcon className="w-5 h-5" />
                            Logout
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="font-medium text-gray-700 hover:text-primary-600 transition-colors"
                >
                  Sign In
                </Link>

                <Link
                  to="/register"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Menu as="div" className="relative">
              <Menu.Button className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition">
                <svg
                  className="w-6 h-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </Menu.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-150"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2">
                  {user ? (
                    <>
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-gray-900">
                          {user.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {user.email}
                        </p>
                      </div>

                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/post-ride"
                            className={`${
                              active ? 'bg-primary-50' : ''
                            } block px-4 py-3 text-gray-700`}
                          >
                            Post a Ride
                          </Link>
                        )}
                      </Menu.Item>

                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/my-rides"
                            className={`${
                              active ? 'bg-primary-50' : ''
                            } block px-4 py-3 text-gray-700`}
                          >
                            My Rides
                          </Link>
                        )}
                      </Menu.Item>

                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/my-bookings"
                            className={`${
                              active ? 'bg-primary-50' : ''
                            } block px-4 py-3 text-gray-700`}
                          >
                            My Bookings
                          </Link>
                        )}
                      </Menu.Item>

                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/profile"
                            className={`${
                              active ? 'bg-primary-50' : ''
                            } block px-4 py-3 text-gray-700`}
                          >
                            Profile
                          </Link>
                        )}
                      </Menu.Item>

                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={logout}
                            className={`${
                              active ? 'bg-red-50 text-red-600' : ''
                            } block w-full text-left px-4 py-3 text-gray-700`}
                          >
                            Logout
                          </button>
                        )}
                      </Menu.Item>
                    </>
                  ) : (
                    <>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/login"
                            className={`${
                              active ? 'bg-primary-50' : ''
                            } block px-4 py-3 text-gray-700`}
                          >
                            Sign In
                          </Link>
                        )}
                      </Menu.Item>

                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/register"
                            className={`${
                              active ? 'bg-primary-50' : ''
                            } block px-4 py-3 text-gray-700`}
                          >
                            Sign Up
                          </Link>
                        )}
                      </Menu.Item>
                    </>
                  )}
                </Menu.Items>
              </Transition>
            </Menu>
          </div>

        </div>
      </div>
    </nav>
  );
}
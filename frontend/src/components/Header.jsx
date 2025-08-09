import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Flex, Badge } from 'antd';
import { BookOutlined, PlusOutlined, UserOutlined, LogoutOutlined, SwapOutlined } from '@ant-design/icons';
import { useAuthStore, useExchangeStore } from '../stores';
import './Header.css';

const { Header: AntHeader } = Layout;

const Header = ({ user, onLogout }) => {
  const { getCurrentUser } = useAuthStore();
  const { fetchReceivedExchanges, getPendingReceivedCount } = useExchangeStore();
  const currentUser = user || getCurrentUser();
  const location = useLocation();
  const pendingCount = getPendingReceivedCount();

  // Fetch pending exchanges when component mounts and periodically
  useEffect(() => {
    if (currentUser) {
      fetchReceivedExchanges().catch(() => {});
      
      // Refresh every 30 seconds to show updated counts
      const interval = setInterval(() => {
        fetchReceivedExchanges().catch(() => {});
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [currentUser, fetchReceivedExchanges]);

  const menuItems = [
    {
      key: '/',
      icon: <BookOutlined />,
      label: <Link to="/">Dashboard</Link>,
    },
    {
      key: '/books',
      icon: <BookOutlined />,
      label: <Link to="/books">Browse Books</Link>,
    },
    {
      key: '/exchanges',
      icon: <SwapOutlined />,
      label: (
        <Link to="/exchanges" className="ant-menu-item-link">
          <Badge count={pendingCount} size="small" offset={[10, 0]} className="badge-menu-item">
            Exchanges
          </Badge>
        </Link>
      ),
    },
    {
      key: '/add-book',
      icon: <PlusOutlined />,
      label: <Link to="/add-book">Add Book</Link>,
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: currentUser?.name || 'Profile',
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: onLogout,
    },
  ];

  return (
    <AntHeader className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md px-6">
      <Flex justify="space-between" align="center" className="h-full">
        <Link to="/" className="flex items-center">
          <BookOutlined className="text-2xl text-blue-600 mr-3" />
          <span className="text-xl font-bold text-gray-800">Book Exchange</span>
        </Link>

        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          className="border-none flex-1 justify-center"
        />

        <Dropdown
          menu={{ items: userMenuItems }}
          placement="bottomRight"
          trigger={['click']}
        >
          <Flex align="center" className="cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg">
            <Avatar icon={<UserOutlined />} size="small" className="mr-2" />
            <span className="text-gray-700">{currentUser?.name}</span>
          </Flex>
        </Dropdown>
      </Flex>
    </AntHeader>
  );
};

export default Header;

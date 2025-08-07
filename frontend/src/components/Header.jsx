import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Flex } from 'antd';
import { BookOutlined, PlusOutlined, UserOutlined, LogoutOutlined, SwapOutlined } from '@ant-design/icons';

const { Header: AntHeader } = Layout;

const Header = ({ user, onLogout }) => {
  const location = useLocation();

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
      label: <Link to="/exchanges">Exchanges</Link>,
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
      label: user?.name || 'Profile',
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
            <span className="text-gray-700">{user?.name}</span>
          </Flex>
        </Dropdown>
      </Flex>
    </AntHeader>
  );
};

export default Header;

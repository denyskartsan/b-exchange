import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card, Row, Col, Statistic, Button, List, Avatar, message, Flex } from 'antd';
import { BookOutlined, SwapOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons';
import { booksAPI } from '../utils/api';

const Dashboard = () => {
  const [myBooks, setMyBooks] = useState([]);
  const [recentBooks, setRecentBooks] = useState([]);
  const [availableForExchange, setAvailableForExchange] = useState(0);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    fetchData();
  }, []);

  // Refresh data when page becomes visible or location changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchData();
      }
    };

    const handleFocus = () => {
      fetchData();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Refresh data when navigating back to dashboard
  useEffect(() => {
    if (location.pathname === '/') {
      fetchData();
    }
  }, [location]);

  const fetchData = async () => {
    try {
      const [myBooksResponse, allBooksResponse] = await Promise.all([
        booksAPI.getMyBooks(),
        booksAPI.getAll()
      ]);
      setMyBooks(myBooksResponse.data);
      
      // Get current user ID from my books
      const currentUserId = myBooksResponse.data.length > 0 ? myBooksResponse.data[0].ownerId : null;
      
      // Filter out user's own books for available exchange count and recent books
      const otherUsersBooks = allBooksResponse.data.filter(book => book.ownerId !== currentUserId);
      const availableBooks = otherUsersBooks.filter(book => book.status === 'available');
      
      setAvailableForExchange(availableBooks.length);
      setRecentBooks(otherUsersBooks.slice(0, 5));
    } catch (error) {
      message.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your book exchange overview.</p>
      </div>

      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="My Books"
              value={myBooks.length}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Available for Exchange"
              value={availableForExchange}
              prefix={<SwapOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Exchanges"
              value={0}
              prefix={<SwapOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title="My Books"
            extra={
              <Link to="/add-book">
                <Button type="primary" icon={<PlusOutlined />} size="small">
                  Add Book
                </Button>
              </Link>
            }
            loading={loading}
          >
            {myBooks.length === 0 ? (
              <div className="text-center py-8">
                <BookOutlined className="text-4xl text-gray-400 mb-4" />
                <p className="text-gray-500 mb-4">You haven't added any books yet.</p>
                <Link to="/add-book">
                  <Button type="primary" icon={<PlusOutlined />}>
                    Add Your First Book
                  </Button>
                </Link>
              </div>
            ) : (
              <List
                dataSource={myBooks.slice(0, 3)}
                renderItem={(book) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<BookOutlined />} />}
                      title={book.title}
                      description={`by ${book.author} • ${book.condition}`}
                    />
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      book.status === 'available' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {book.status}
                    </div>
                  </List.Item>
                )}
              />
            )}
            {myBooks.length > 3 && (
              <div className="text-center mt-4">
                <Link to="/books?filter=my">
                  <Button type="link">View All My Books</Button>
                </Link>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="Recently Added Books"
            extra={
              <Link to="/books">
                <Button type="link" size="small">
                  Browse All
                </Button>
              </Link>
            }
            loading={loading}
          >
            {recentBooks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No books available for exchange yet.</p>
              </div>
            ) : (
              <List
                dataSource={recentBooks}
                renderItem={(book) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} />}
                      title={book.title}
                      description={`by ${book.author} • Owner: ${book.owner?.name}`}
                    />
                    <Button type="link" size="small">
                      View
                    </Button>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;

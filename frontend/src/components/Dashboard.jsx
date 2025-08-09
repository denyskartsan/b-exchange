import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card, Row, Col, Statistic, Button, List, Avatar, message, Flex } from 'antd';
import { BookOutlined, SwapOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons';
import { useBooksStore } from '../stores';

const Dashboard = () => {
  const { 
    myBooks, 
    recentBooks, 
    availableForExchange, 
    isLoading, 
    error, 
    fetchDashboardData,
    clearError 
  } = useBooksStore();
  const location = useLocation();

  // Simple fetch on mount
  useEffect(() => {
    handleFetchData();
  }, []);

  // Optionally refresh when navigating back to dashboard
  useEffect(() => {
    if (location.pathname === '/') {
      handleFetchData();
    }
  }, [location.pathname]);

  // Handle error messages
  useEffect(() => {
    if (error) {
      message.error(error);
      clearError();
    }
  }, [error, clearError]);

  const isFetchingRef = useRef(false);

  const renderBookAvatar = (book) => {
    if (book?.coverImageUrl) {
      return (
        <Avatar
          src={book.coverImageUrl}
          alt={`${book.title} cover`}
          size="large"
          onError={(e) => {
            // hide broken image, antd will fallback to default icon if src removed
            e.currentTarget.src = '';
          }}
        />
      );
    }
    return <Avatar icon={<BookOutlined />} />;
  };

  const handleFetchData = async () => {
    if (isFetchingRef.current) return; // prevent overlapping requests
    isFetchingRef.current = true;
    try {
      await fetchDashboardData();
    } catch (error) {
      console.log(error)
    } finally {
      isFetchingRef.current = false;
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
            loading={isLoading}
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
                      avatar={renderBookAvatar(book)}
                      title={book.title}
                      description={`by ${book.author} • ${book.condition}`}
                    />
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      book.status === 'available' 
                        ? 'bg-green-100 text-green-800' 
                        : book.status === 'exchanged-available'
                        ? 'bg-purple-100 text-purple-800'
                        : book.status === 'pending-exchange'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {book.status === 'available' 
                        ? 'Available' 
                        : book.status === 'exchanged-available'
                        ? 'Exchanged'
                        : book.status === 'pending-exchange'
                        ? 'Pending'
                        : book.status}
                    </div>
                  </List.Item>
                )}
              />
            )}
            {myBooks.length > 3 && (
              <div className="text-center mt-4">
                <Link to="/books?filter=my">
                  <Button type="link">View All Books</Button>
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
            loading={isLoading}
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
                      avatar={renderBookAvatar(book)}
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

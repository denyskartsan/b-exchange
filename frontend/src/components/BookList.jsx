import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Input, Select, Button, message, Avatar, Tag, Empty, Modal, List, Divider, Popconfirm } from 'antd';
import { SearchOutlined, BookOutlined, UserOutlined, SwapOutlined, DeleteOutlined } from '@ant-design/icons';
import { useBooksStore, useAuthStore, useUIStore, useExchangeStore } from '../stores';

const { Option } = Select;
const { Search } = Input;

const BookList = () => {
  const { books, myBooks, fetchBooks, fetchMyBooks, isLoading, error, clearError, deleteBook } = useBooksStore();
  const { getCurrentUser } = useAuthStore();
  const { openModal, closeModal, isModalOpen, getModalData } = useUIStore();
  const { createExchange } = useExchangeStore();
  
  // Local state for filtering
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  
  // Exchange related local state
  const [selectedOfferedBook, setSelectedOfferedBook] = useState(null);
  const [exchangeMessage, setExchangeMessage] = useState('');
  const [exchangeLoading, setExchangeLoading] = useState(false);
  
  const currentUser = getCurrentUser();
  const exchangeModalVisible = isModalOpen('exchange');
  const selectedBook = getModalData('exchange');

  useEffect(() => {
    handleFetchBooks();
  }, []);

  useEffect(() => {
    filterBooks();
  }, [books, searchTerm, genreFilter, conditionFilter]);

  // Handle error messages
  useEffect(() => {
    if (error) {
      message.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleFetchBooks = async () => {
    try {
      await fetchBooks();
    } catch (error) {
      // Error is handled by the store
    }
  };

  const filterBooks = () => {
    let filtered = books;

    if (searchTerm) {
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (genreFilter) {
      filtered = filtered.filter(book => book.genre === genreFilter);
    }

    if (conditionFilter) {
      filtered = filtered.filter(book => book.condition === conditionFilter);
    }

    setFilteredBooks(filtered);
  };

  const handleExchange = async (book) => {
    setSelectedOfferedBook(null);
    setExchangeMessage('');
    
    // Fetch user's available books if not already loaded
    try {
      if (!myBooks?.length) {
        await fetchMyBooks();
      }
      openModal('exchange', book);
    } catch (error) {
      message.error('Failed to load your books');
    }
  };

  const handleExchangeConfirm = async () => {
    if (!selectedOfferedBook) {
      message.error('Please select a book to offer in exchange');
      return;
    }

    setExchangeLoading(true);
    try {
      await createExchange({
        requestedBookId: selectedBook.id,
        offeredBookId: selectedOfferedBook.id,
        message: exchangeMessage
      });
      
      message.success(`Exchange request sent to ${selectedBook.owner?.name}!`);
      closeModal('exchange');
      setSelectedOfferedBook(null);
      setExchangeMessage('');
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to send exchange request');
    } finally {
      setExchangeLoading(false);
    }
  };

  const handleModalCancel = () => {
    closeModal('exchange');
    setSelectedOfferedBook(null);
    setExchangeMessage('');
  };

  const isOwnBook = (book) => {
    return currentUser && book.ownerId === currentUser.id;
  };

  const handleDeleteBook = async (bookId) => {
    try {
      await deleteBook(bookId);
      message.success('Book deleted');
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to delete book');
    }
  };

  const getConditionColor = (condition) => {
    const colors = {
      'Like New': 'green',
      'Very Good': 'blue',
      'Good': 'cyan',
      'Fair': 'orange',
      'Poor': 'red'
    };
    return colors[condition] || 'default';
  };

  const genres = [...new Set(books.map(book => book.genre))].filter(Boolean);
  const conditions = [...new Set(books.map(book => book.condition))].filter(Boolean);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Browse Books</h1>
        <p className="text-gray-600">Find your next great read!</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              data-testid="book-search-input"
              placeholder="Search by title or author"
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              data-testid="genre-filter-select"
              placeholder="Genre"
              value={genreFilter}
              onChange={setGenreFilter}
              allowClear
              className="w-full"
            >
              {genres.map(genre => (
                <Option key={genre} value={genre}>{genre}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              data-testid="condition-filter-select"
              placeholder="Condition"
              value={conditionFilter}
              onChange={setConditionFilter}
              allowClear
              className="w-full"
            >
              {conditions.map(condition => (
                <Option key={condition} value={condition}>{condition}</Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Book Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredBooks.length === 0 ? (
        <Empty
          image={<BookOutlined className="text-4xl text-gray-400" />}
          description="No books found"
        />
      ) : (
        <Row gutter={[16, 16]}>
          {filteredBooks.map((book) => (
            <Col xs={24} sm={12} md={8} lg={6} key={book.id}>
              <Card
                data-testid={`book-card-${book.id}`}
                className="h-full hover:shadow-lg transition-shadow"
                cover={
                  book.coverImageUrl ? (
                    <img
                      src={book.coverImageUrl}
                      alt={`${book.title} cover`}
                      className="h-48 w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                      <BookOutlined className="text-4xl text-blue-400" />
                    </div>
                  )
                }
                actions={[
                  isOwnBook(book) ? (
                    <Popconfirm
                      title="Delete this book?"
                      description="This action cannot be undone."
                      okText="Delete"
                      okButtonProps={{ danger: true }}
                      cancelText="Cancel"
                      onConfirm={() => handleDeleteBook(book.id)}
                    >
                      <Button danger icon={<DeleteOutlined />} data-testid={`delete-book-${book.id}`}>
                        Delete
                      </Button>
                    </Popconfirm>
                  ) : (
                    <Button
                      data-testid={`exchange-button-${book.id}`}
                      type="primary"
                      icon={<SwapOutlined />}
                      onClick={() => handleExchange(book)}
                      disabled={book.status !== 'available'}
                    >
                      {book.status === 'available' ? 'Exchange' : 'Not Available'}
                    </Button>
                  )
                ]}
              >
                <Card.Meta
                  title={
                    <div className="truncate" title={book.title}>
                      {book.title}
                    </div>
                  }
                  description={
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">by {book.author}</div>
                      <div className="flex justify-between items-center">
                        <Tag color="blue">{book.genre}</Tag>
                        <Tag color={getConditionColor(book.condition)}>
                          {book.condition}
                        </Tag>
                      </div>
                      <div className="flex items-center text-xs text-gray-500 mt-2">
                        <Avatar size="small" icon={<UserOutlined />} className="mr-1" />
                        <span>{book.owner?.name || 'Unknown'}</span>
                      </div>
                      {book.description && (
                        <div className="text-xs text-gray-600 line-clamp-2">
                          {book.description}
                        </div>
                      )}
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Exchange Modal */}
      <Modal
        title={`Request Exchange: ${selectedBook?.title || ''}`}
        open={exchangeModalVisible}
        onOk={handleExchangeConfirm}
        onCancel={handleModalCancel}
        okText="Send Exchange Request"
        cancelText="Cancel"
        confirmLoading={exchangeLoading}
        okButtonProps={{ disabled: !selectedOfferedBook }}
        width={700}
      >
        {selectedBook && (
          <div className="space-y-6">
            {/* Requested Book Info */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">You want this book:</h4>
              <div className="flex items-start space-x-3">
                <BookOutlined className="text-2xl text-blue-500 mt-1" />
                <div>
                  <h3 className="font-semibold">{selectedBook.title}</h3>
                  <p className="text-sm text-gray-600">by {selectedBook.author}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Tag color="blue">{selectedBook.genre}</Tag>
                    <Tag color={getConditionColor(selectedBook.condition)}>{selectedBook.condition}</Tag>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Owner: {selectedBook.owner?.name}</p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <Divider className="my-4">
              <SwapOutlined className="text-gray-400" />
            </Divider>

            {/* User's Books Selection */}
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-3">Select a book to offer in exchange:</h4>
              {myBooks.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <BookOutlined className="text-3xl text-gray-400 mb-2" />
                  <p className="text-gray-500 text-sm">You don't have any available books to exchange.</p>
                  <p className="text-gray-400 text-xs mt-1">Add some books to your collection first!</p>
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto border rounded-lg">
                  <List
                    dataSource={myBooks}
                    renderItem={(book) => (
                      <List.Item
                        className={`cursor-pointer transition-colors ${
                          selectedOfferedBook?.id === book.id 
                            ? 'bg-green-50 border-green-200' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedOfferedBook(book)}
                      >
                        <List.Item.Meta
                          avatar={
                            <div className="flex items-center">
                              <input 
                                type="radio" 
                                checked={selectedOfferedBook?.id === book.id}
                                onChange={() => setSelectedOfferedBook(book)}
                                className="mr-3"
                              />
                              <Avatar icon={<BookOutlined />} />
                            </div>
                          }
                          title={<span className="font-medium">{book.title}</span>}
                          description={
                            <div className="space-y-1">
                              <div className="text-sm text-gray-600">by {book.author}</div>
                              <div className="flex items-center space-x-2">
                                <Tag size="small" color="blue">{book.genre}</Tag>
                                <Tag size="small" color={getConditionColor(book.condition)}>
                                  {book.condition}
                                </Tag>
                              </div>
                              {book.description && (
                                <div className="text-xs text-gray-500 line-clamp-1">
                                  {book.description}
                                </div>
                              )}
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </div>
              )}
            </div>

            {/* Optional Message */}
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Message (optional):</h4>
              <Input.TextArea
                value={exchangeMessage}
                onChange={(e) => setExchangeMessage(e.target.value)}
                placeholder={`Hi ${selectedBook.owner?.name}, I'd like to exchange books with you...`}
                rows={3}
                maxLength={200}
                showCount
              />
            </div>

            {/* Summary */}
            {selectedOfferedBook && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-green-800 mb-2">Exchange Summary:</h4>
                <div className="text-sm text-green-700">
                  You're offering <strong>"{selectedOfferedBook.title}"</strong> by {selectedOfferedBook.author} 
                  in exchange for <strong>"{selectedBook.title}"</strong> by {selectedBook.author}.
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BookList;

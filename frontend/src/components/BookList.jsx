import  { useState, useEffect } from 'react';
import { Card, Row, Col, Input, Select, Button, message, Avatar, Tag, Empty, Modal, List, Divider, Popconfirm, Form, Rate } from 'antd';
import { SearchOutlined, BookOutlined, UserOutlined, SwapOutlined, DeleteOutlined, EditOutlined, StarFilled, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useBooksStore, useAuthStore, useUIStore, useExchangeStore } from '../stores';
import BookForm from './BookForm';
import ExchangeConfirmationModal from './ExchangeConfirmationModal';
import { BOOK_CONDITIONS, getConditionColor, getConditionStars } from '../constants/bookConstants';

const { Option } = Select;
const { Search } = Input;

const BookList = () => {
  const { books, myBooks, fetchBooks, fetchMyBooks, isLoading, error, clearError, deleteBook, updateBook } = useBooksStore();
  const { getCurrentUser } = useAuthStore();
  const { openModal, closeModal, isModalOpen, getModalData } = useUIStore();
  const { createExchange, receivedExchanges, fetchReceivedExchanges, respondToExchange, responseLoading } = useExchangeStore();
  
  // Local state for filtering
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState(undefined);
  const [conditionFilter, setConditionFilter] = useState(undefined);
  const [ownershipFilter, setOwnershipFilter] = useState(undefined);
  
  // Exchange related local state
  const [selectedOfferedBook, setSelectedOfferedBook] = useState(null);
  const [exchangeMessage, setExchangeMessage] = useState('');
  const [exchangeLoading, setExchangeLoading] = useState(false);
  // Edit related local state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [editForm] = Form.useForm();
  // Exchange response confirmation modal state
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  
  const currentUser = getCurrentUser();
  const exchangeModalVisible = isModalOpen('exchange');
  const selectedBook = getModalData('exchange');

  useEffect(() => {
    handleFetchBooks();
    // Also fetch received exchanges to show Accept/Decline buttons
    if (currentUser) {
      fetchReceivedExchanges().catch(() => {});
    }
  }, [currentUser]);

  useEffect(() => {
    filterBooks();
  }, [books, searchTerm, genreFilter, conditionFilter, ownershipFilter, currentUser]);

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
      console.log(error)
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

    if (ownershipFilter) {
      if (ownershipFilter === 'my-books') {
        filtered = filtered.filter(book => currentUser && book.ownerId === currentUser.id);
      } else if (ownershipFilter === 'others-books') {
        filtered = filtered.filter(book => !currentUser || book.ownerId !== currentUser.id);
      }
      // 'all-books' doesn't need additional filtering
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
      message.error('Failed to load your books', error);
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
      
      // Refresh book list to show updated statuses
      await handleFetchBooks();
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
  
  // Find pending exchange request where current user can respond (they want your book, offering theirs)
  const getPendingExchangeWhereCanRespond = (bookId) => {
    return receivedExchanges.find(exchange => 
      exchange.offeredBook?.id === bookId && exchange.status === 'pending'
    );
  };

  // Handle opening the exchange response confirmation modal
  const handleExchangeResponse = (exchange, action) => {
    setSelectedExchange(exchange);
    setSelectedAction(action);
    setConfirmModalVisible(true);
  };

  // Handle confirming the exchange response
  const handleConfirmExchangeResponse = async () => {
    if (!selectedExchange || !selectedAction) return;
    
    try {
      await respondToExchange(selectedExchange.id, selectedAction);
      message.success(`Exchange ${selectedAction}ed successfully!`);
      setConfirmModalVisible(false);
      setSelectedExchange(null);
      setSelectedAction(null);
      // Refresh both books and exchanges to show updated statuses
      await Promise.all([
        handleFetchBooks(),
        fetchReceivedExchanges()
      ]);
    } catch (error) {
      message.error(error.response?.data?.message || `Failed to ${selectedAction} exchange`);
    }
  };

  // Handle canceling the exchange response confirmation
  const handleCancelExchangeResponse = () => {
    setConfirmModalVisible(false);
    setSelectedExchange(null);
    setSelectedAction(null);
  };


  const getStatusColor = (status) => {
    const colors = {
      'available': 'green',
      'exchanged-available': 'purple', 
      'pending-exchange': 'orange'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      'available': 'Available',
      'exchanged-available': 'Exchanged',
      'pending-exchange': 'Pending'
    };
    return texts[status] || status;
  };


  const genres = [...new Set(books.map(book => book.genre))].filter(Boolean);
  const availableConditions = [...new Set(books.map(book => book.condition))].filter(Boolean);
  
  // Create condition options with disabled state for unavailable conditions
  const conditionOptions = BOOK_CONDITIONS.map(condition => ({
    value: condition,
    label: condition,
    disabled: !availableConditions.includes(condition)
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Browse Books</h1>
        <p className="text-gray-600">Find your next great read!</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
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
              data-testid="ownership-filter-select"
              placeholder="Ownership"
              value={ownershipFilter}
              onChange={setOwnershipFilter}
              allowClear
              className="w-full"
            >
              <Option value="all-books">All Books</Option>
              <Option value="my-books">My Books</Option>
              <Option value="others-books">Others' Books</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              data-testid="genre-filter-select"
              placeholder="Genre"
              value={genreFilter}
              onChange={setGenreFilter}
              allowClear
              className="w-full"
              notFoundContent={isLoading ? 'Loading...' : 'No genres available'}
            >
              {genres.length > 0 && genres.map(genre => (
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
              notFoundContent={isLoading ? 'Loading...' : 'No conditions available'}
            >
              {conditionOptions.map(({ value, label, disabled }) => (
                <Option key={value} value={value} disabled={disabled}>
                  {label} {disabled && '(No books)'}
                </Option>
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
                className="h-full hover:shadow-lg transition-shadow relative"
                cover={
                  <div className="relative">
                    {book.coverImageUrl ? (
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
                    )}
                    {/* Star Rating in top-right corner */}
                    <div className="absolute top-2 right-2 bg-white bg-opacity-90 px-2 py-1 rounded-md shadow-sm">
                      <Rate 
                        disabled 
                        value={getConditionStars(book.condition)} 
                        style={{ fontSize: '12px', color: '#faad14' }}
                      />
                    </div>
                  </div>
                }
                actions={(() => {
                  const pendingExchangeWhereICanRespond = getPendingExchangeWhereCanRespond(book.id);
                  
                  if (isOwnBook(book)) {
                    // Show normal Edit/Delete buttons for owned books
                    return [
                      <div className="flex gap-2" key="owner-actions">
                        {book.status !== 'exchanged' && (
                          <Button
                            icon={<EditOutlined />}
                            onClick={() => {
                              setEditingBook(book);
                              setEditModalVisible(true);
                              editForm.setFieldsValue({
                                title: book.title,
                                author: book.author,
                                genre: book.genre,
                                condition: book.condition,
                                description: book.description,
                                coverImageUrl: book.coverImageUrl,
                              });
                            }}
                          >
                            Edit
                          </Button>
                        )}
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
                      </div>
                    ];
                  } else {
                    // For other people's books
                    // If there's a pending exchange where I can respond (they want my book, offering theirs), show Accept/Decline
                    if (pendingExchangeWhereICanRespond) {
                      return [
                        <div className="flex gap-1" key="exchange-response">
                          <Button 
                            type="primary" 
                            icon={<CheckOutlined />} 
                            size="small"
                            loading={responseLoading}
                            onClick={() => handleExchangeResponse(pendingExchangeWhereICanRespond, 'accept')}
                          >
                            Accept
                          </Button>
                          <Button 
                            danger 
                            icon={<CloseOutlined />} 
                            size="small"
                            loading={responseLoading}
                            onClick={() => handleExchangeResponse(pendingExchangeWhereICanRespond, 'decline')}
                          >
                            Decline
                          </Button>
                        </div>
                      ];
                    }
                    
                    // Otherwise show normal Exchange button
                    return [
                      <Button
                        key="exchange-action"
                        data-testid={`exchange-button-${book.id}`}
                        type="primary"
                        icon={<SwapOutlined />}
                        onClick={() => handleExchange(book)}
                        disabled={book.status === 'pending-exchange'}
                      >
                        {book.status === 'pending-exchange' ? 'Pending Exchange' : 'Exchange'}
                      </Button>
                    ];
                  }
                })()}
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
                        <Tag color={getStatusColor(book.status)}>
                          {getStatusText(book.status)}
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

      {/* Edit Book Modal */}
      {editingBook && editModalVisible && (
        <Modal
          title={`Edit: ${editingBook.title}`}
          open={editModalVisible}
          onCancel={() => { setEditModalVisible(false); setEditingBook(null); }}
          onOk={async () => {
            try {
              const values = await editForm.validateFields();
              await updateBook(editingBook.id, values);
              message.success('Book updated');
              setEditModalVisible(false);
              setEditingBook(null);
            } catch (error) {
              console.error(error);
            }
          }}
          okText="Save"
          cancelText="Cancel"
        >
          <BookForm
            form={editForm}
            onFinish={async (values) => {
              try {
                await updateBook(editingBook.id, values);
                message.success('Book updated');
                setEditModalVisible(false);
                setEditingBook(null);
              } catch (error) {
                console.error(error);
              }
            }}
            initialValues={{
              title: editingBook.title,
              author: editingBook.author,
              genre: editingBook.genre,
              condition: editingBook.condition,
              description: editingBook.description,
              coverImageUrl: editingBook.coverImageUrl,
            }}
            showStatus={false}
          />
        </Modal>
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
                dataSource={myBooks.filter(book => book.status === 'available' || book.status === 'exchanged-available')}
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

      {/* Exchange Response Confirmation Modal */}
      <ExchangeConfirmationModal
        open={confirmModalVisible}
        exchange={selectedExchange}
        action={selectedAction}
        onConfirm={handleConfirmExchangeResponse}
        onCancel={handleCancelExchangeResponse}
        loading={responseLoading}
      />
    </div>
  );
};

export default BookList;

import React, { useEffect, useState } from 'react';
import { Card, Tabs, List, Button, message, Tag, Avatar, Empty } from 'antd';
import { BookOutlined, SwapOutlined, UserOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useExchangeStore } from '../stores';
import ExchangeConfirmationModal from './ExchangeConfirmationModal';

const { TabPane } = Tabs;

const Exchanges = () => {
  const { 
    receivedExchanges, 
    sentExchanges, 
    isLoading, 
    responseLoading, 
    error, 
    fetchAllExchanges, 
    respondToExchange,
    getPendingReceivedCount,
    getPendingSentCount,
    clearError 
  } = useExchangeStore();
  
  // State for confirmation modal
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);

  useEffect(() => {
    handleFetchExchanges();
  }, []);

  // Handle error messages
  useEffect(() => {
    if (error) {
      message.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleFetchExchanges = async () => {
    try {
      await fetchAllExchanges();
    } catch (error) {
     console.log(error)
    }
  };

  const handleExchangeResponse = (exchange, action) => {
    setSelectedExchange(exchange);
    setSelectedAction(action);
    setConfirmModalVisible(true);
  };

  const handleConfirmExchange = async () => {
    if (!selectedExchange || !selectedAction) return;
    
    try {
      await respondToExchange(selectedExchange.id, selectedAction);
      message.success(`Exchange ${selectedAction}ed successfully!`);
      setConfirmModalVisible(false);
      setSelectedExchange(null);
      setSelectedAction(null);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCancelConfirm = () => {
    setConfirmModalVisible(false);
    setSelectedExchange(null);
    setSelectedAction(null);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      accepted: 'green',
      declined: 'red'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pending',
      accepted: 'Accepted',
      declined: 'Declined'
    };
    return texts[status] || status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return console.log('invalid date', error)
    }
  };

  const renderExchangeItem = (exchange, isReceived) => (
    <List.Item
      key={exchange.id}
      actions={
        isReceived && exchange.status === 'pending' ? [
          <Button 
            type="primary" 
            icon={<CheckOutlined />} 
            size="small"
            loading={responseLoading}
            onClick={() => handleExchangeResponse(exchange, 'accept')}
          >
            Accept
          </Button>,
          <Button 
            danger 
            icon={<CloseOutlined />} 
            size="small"
            loading={responseLoading}
            onClick={() => handleExchangeResponse(exchange, 'decline')}
          >
            Decline
          </Button>
        ] : []
      }
    >
      <List.Item.Meta
        avatar={<Avatar icon={<SwapOutlined />} />}
        title={
          <div className="flex items-center justify-between">
            <span>
              {isReceived ? 'Incoming Request' : 'Outgoing Request'}
            </span>
            <Tag color={getStatusColor(exchange.status)}>
              {getStatusText(exchange.status)}
            </Tag>
          </div>
        }
        description={
          <div className="space-y-3">
            <div className="text-sm">
              {isReceived ? (
                <span>
                  <strong>{exchange.requesterName}</strong> wants to exchange:
                </span>
              ) : (
                <span>
                  You want to exchange with <strong>{exchange.ownerName}</strong>:
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-blue-50 p-3 rounded">
                <div className="font-semibold text-blue-800 mb-1">
                  {isReceived ? 'They want:' : 'You want:'}
                </div>
                <div className="font-medium">{exchange.requestedBook?.title || 'Book title unavailable'}</div>
                <div className="text-gray-600">by {exchange.requestedBook?.author || 'Unknown author'}</div>
                <Tag size="small" color="cyan">{exchange.requestedBook?.condition || 'Unknown condition'}</Tag>
              </div>
              
              <div className="bg-green-50 p-3 rounded">
                <div className="font-semibold text-green-800 mb-1">
                  {isReceived ? 'They offer:' : 'You offer:'}
                </div>
                <div className="font-medium">{exchange.offeredBook?.title || 'Book title unavailable'}</div>
                <div className="text-gray-600">by {exchange.offeredBook?.author || 'Unknown author'}</div>
                <Tag size="small" color="green">{exchange.offeredBook?.condition || 'Unknown condition'}</Tag>
              </div>
            </div>

            {exchange.message && (
              <div className="bg-gray-50 p-3 rounded">
                <div className="font-semibold text-gray-700 mb-1">Message:</div>
                <div className="text-gray-600 italic">"{exchange.message}"</div>
              </div>
            )}
            
            <div className="text-xs text-gray-500">
              Requested on {formatDate(exchange.createdAt)}
              {exchange.respondedAt && (
                <span> • Responded on {formatDate(exchange.respondedAt)}</span>
              )}
            </div>
          </div>
        }
      />
    </List.Item>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Exchanges</h1>
        <p className="text-gray-600">Manage your book exchange requests</p>
      </div>

      <Card>
        <Tabs defaultActiveKey="pending-received" size="large">
          <TabPane 
            tab={`Pending Received (${getPendingReceivedCount()})`} 
            key="pending-received"
          >
            {receivedExchanges.filter(ex => ex.status === 'pending').length === 0 ? (
              <Empty 
                image={<SwapOutlined className="text-4xl text-gray-400" />}
                description="No pending exchange requests received"
              />
            ) : (
              <List
                loading={isLoading}
                dataSource={receivedExchanges.filter(ex => ex.status === 'pending')}
                renderItem={(exchange) => renderExchangeItem(exchange, true)}
                pagination={{ pageSize: 5, showSizeChanger: false }}
              />
            )}
          </TabPane>

          <TabPane 
            tab={`Pending Sent (${getPendingSentCount()})`} 
            key="pending-sent"
          >
            {sentExchanges.filter(ex => ex.status === 'pending').length === 0 ? (
              <Empty 
                image={<SwapOutlined className="text-4xl text-gray-400" />}
                description="No pending exchange requests sent"
              />
            ) : (
              <List
                loading={isLoading}
                dataSource={sentExchanges.filter(ex => ex.status === 'pending')}
                renderItem={(exchange) => renderExchangeItem(exchange, false)}
                pagination={{ pageSize: 5, showSizeChanger: false }}
              />
            )}
          </TabPane>

          <TabPane 
            tab={`History (${receivedExchanges.filter(ex => ex.status !== 'pending').length + sentExchanges.filter(ex => ex.status !== 'pending').length})`} 
            key="history"
          >
            <Tabs type="card" size="small">
              <TabPane 
                tab={`Received (${receivedExchanges.filter(ex => ex.status !== 'pending').length})`} 
                key="history-received"
              >
                {receivedExchanges.filter(ex => ex.status !== 'pending').length === 0 ? (
                  <Empty 
                    image={<SwapOutlined className="text-4xl text-gray-400" />}
                    description="No completed exchange requests received"
                  />
                ) : (
                  <List
                    loading={isLoading}
                    dataSource={receivedExchanges.filter(ex => ex.status !== 'pending')}
                    renderItem={(exchange) => renderExchangeItem(exchange, true)}
                    pagination={{ pageSize: 5, showSizeChanger: false }}
                  />
                )}
              </TabPane>

              <TabPane 
                tab={`Sent (${sentExchanges.filter(ex => ex.status !== 'pending').length})`} 
                key="history-sent"
              >
                {sentExchanges.filter(ex => ex.status !== 'pending').length === 0 ? (
                  <Empty 
                    image={<SwapOutlined className="text-4xl text-gray-400" />}
                    description="No completed exchange requests sent"
                  />
                ) : (
                  <List
                    loading={isLoading}
                    dataSource={sentExchanges.filter(ex => ex.status !== 'pending')}
                    renderItem={(exchange) => renderExchangeItem(exchange, false)}
                    pagination={{ pageSize: 5, showSizeChanger: false }}
                  />
                )}
              </TabPane>
            </Tabs>
          </TabPane>
        </Tabs>
      </Card>
      
      {/* Confirmation Modal */}
      <ExchangeConfirmationModal
        open={confirmModalVisible}
        exchange={selectedExchange}
        action={selectedAction}
        onConfirm={handleConfirmExchange}
        onCancel={handleCancelConfirm}
        loading={responseLoading}
      />
    </div>
  );
};

export default Exchanges;

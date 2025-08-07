import React, { useState, useEffect } from 'react';
import { Card, Tabs, List, Button, message, Tag, Avatar, Empty, Modal } from 'antd';
import { BookOutlined, SwapOutlined, UserOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { exchangeAPI } from '../utils/api';

const { TabPane } = Tabs;

const Exchanges = () => {
  const [receivedExchanges, setReceivedExchanges] = useState([]);
  const [sentExchanges, setSentExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responseLoading, setResponseLoading] = useState(false);

  useEffect(() => {
    fetchExchanges();
  }, []);

  const fetchExchanges = async () => {
    try {
      const [receivedResponse, sentResponse] = await Promise.all([
        exchangeAPI.getReceived(),
        exchangeAPI.getSent()
      ]);
      setReceivedExchanges(receivedResponse.data);
      setSentExchanges(sentResponse.data);
    } catch (error) {
      message.error('Failed to fetch exchanges');
    } finally {
      setLoading(false);
    }
  };

  const handleExchangeResponse = async (exchangeId, action) => {
    Modal.confirm({
      title: `${action === 'accept' ? 'Accept' : 'Decline'} Exchange Request`,
      content: `Are you sure you want to ${action} this exchange request? ${action === 'accept' ? 'The books will be swapped immediately.' : 'This action cannot be undone.'}`,
      onOk: async () => {
        setResponseLoading(true);
        try {
          await exchangeAPI.respond(exchangeId, action);
          message.success(`Exchange ${action}ed successfully!`);
          fetchExchanges(); // Refresh the list
        } catch (error) {
          message.error(error.response?.data?.message || `Failed to ${action} exchange`);
        } finally {
          setResponseLoading(false);
        }
      }
    });
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
            onClick={() => handleExchangeResponse(exchange.id, 'accept')}
          >
            Accept
          </Button>,
          <Button 
            danger 
            icon={<CloseOutlined />} 
            size="small"
            loading={responseLoading}
            onClick={() => handleExchangeResponse(exchange.id, 'decline')}
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
              <strong>
                {isReceived ? exchange.requesterName : exchange.ownerName}
              </strong> wants to exchange:
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-blue-50 p-3 rounded">
                <div className="font-semibold text-blue-800 mb-1">
                  {isReceived ? 'They want:' : 'You want:'}
                </div>
                <div className="font-medium">{exchange.requestedBook.title}</div>
                <div className="text-gray-600">by {exchange.requestedBook.author}</div>
                <Tag size="small" color="cyan">{exchange.requestedBook.condition}</Tag>
              </div>
              
              <div className="bg-green-50 p-3 rounded">
                <div className="font-semibold text-green-800 mb-1">
                  {isReceived ? 'They offer:' : 'You offer:'}
                </div>
                <div className="font-medium">{exchange.offeredBook.title}</div>
                <div className="text-gray-600">by {exchange.offeredBook.author}</div>
                <Tag size="small" color="green">{exchange.offeredBook.condition}</Tag>
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
        <Tabs defaultActiveKey="received" size="large">
          <TabPane 
            tab={`Received (${receivedExchanges.filter(ex => ex.status === 'pending').length})`} 
            key="received"
          >
            {receivedExchanges.length === 0 ? (
              <Empty 
                image={<SwapOutlined className="text-4xl text-gray-400" />}
                description="No exchange requests received"
              />
            ) : (
              <List
                loading={loading}
                dataSource={receivedExchanges}
                renderItem={(exchange) => renderExchangeItem(exchange, true)}
                pagination={{ pageSize: 5, showSizeChanger: false }}
              />
            )}
          </TabPane>

          <TabPane 
            tab={`Sent (${sentExchanges.filter(ex => ex.status === 'pending').length})`} 
            key="sent"
          >
            {sentExchanges.length === 0 ? (
              <Empty 
                image={<SwapOutlined className="text-4xl text-gray-400" />}
                description="No exchange requests sent"
              />
            ) : (
              <List
                loading={loading}
                dataSource={sentExchanges}
                renderItem={(exchange) => renderExchangeItem(exchange, false)}
                pagination={{ pageSize: 5, showSizeChanger: false }}
              />
            )}
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default Exchanges;

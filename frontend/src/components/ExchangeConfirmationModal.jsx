import React from 'react';
import { Modal } from 'antd';

const ExchangeConfirmationModal = ({
  open,
  exchange,
  action, // 'accept' or 'decline'
  onConfirm,
  onCancel,
  loading = false
}) => {
  if (!exchange) return null;

  return (
    <Modal
      title={`${action === 'accept' ? 'Accept' : 'Decline'} Exchange Request`}
      open={open}
      onOk={onConfirm}
      onCancel={onCancel}
      okText={action === 'accept' ? 'Accept' : 'Decline'}
      okButtonProps={{
        danger: action === 'decline',
        type: action === 'accept' ? 'primary' : 'default'
      }}
      cancelText="Cancel"
      confirmLoading={loading}
    >
      <div className="space-y-4">
        <p>
          Are you sure you want to {action} this exchange request?
          {action === 'accept' && ' The books will be swapped immediately.'}
        </p>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-3">Exchange Details:</h4>
          
          <div className="space-y-2 text-sm">
            <div>
              <strong>Requester:</strong> {exchange.requesterName || 'Unknown'}
            </div>
            
            <div>
              <strong>They want:</strong> "{exchange.requestedBook?.title}" by {exchange.requestedBook?.author}
            </div>
            
            <div>
              <strong>They offer:</strong> "{exchange.offeredBook?.title}" by {exchange.offeredBook?.author}
            </div>
            
            {exchange.message && (
              <div>
                <strong>Message:</strong>
                <div className="italic text-gray-600 mt-1">
                  "{exchange.message}"
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ExchangeConfirmationModal;

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Button, message, Row, Col } from 'antd';
import { useBooksStore } from '../stores';
import BookForm from './BookForm';

const AddBook = () => {
  const { addBook, isLoading, error, clearError } = useBooksStore();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // Handle error messages
  useEffect(() => {
    if (error) {
      message.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleSubmit = async (values) => {
    try {
      await addBook(values);
      message.success('Book added successfully!');
      form.resetFields();
      navigate('/');
    } catch (error) {
      // Error is handled by the store and useEffect above
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Add New Book</h1>
        <p className="text-gray-600">Share your books with the community!</p>
      </div>

      <Row justify="center">
        <Col xs={24} lg={16}>
          <Card className="shadow-lg">
            <BookForm
              form={form}
              onFinish={handleSubmit}
            >
              <Form.Item>
                <Button
                  data-testid="add-book-button"
                  type="primary"
                  htmlType="submit"
                  loading={isLoading}
                  size="large"
                  className="w-full"
                >
                  Add Book to Exchange
                </Button>
              </Form.Item>
            </BookForm>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AddBook;

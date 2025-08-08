import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Select, Button, message, Row, Col } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import { useBooksStore } from '../stores';

const { Option } = Select;
const { TextArea } = Input;

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
            <Form
              form={form}
              onFinish={handleSubmit}
              layout="vertical"
              size="large"
              className="space-y-4"
            >
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="title"
                    label="Book Title"
                    rules={[{ required: true, message: 'Please enter the book title' }]}
                  >
                    <Input
                      data-testid="book-title-input"
                      placeholder="Enter book title"
                      prefix={<BookOutlined />}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="author"
                    label="Author"
                    rules={[{ required: true, message: 'Please enter the author name' }]}
                  >
                    <Input
                      data-testid="book-author-input"
                      placeholder="Enter author name"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="genre"
                    label="Genre"
                    rules={[{ required: true, message: 'Please select a genre' }]}
                  >
                    <Select
                      data-testid="book-genre-select"
                      placeholder="Select genre"
                    >
                      <Option value="Fiction">Fiction</Option>
                      <Option value="Non-Fiction">Non-Fiction</Option>
                      <Option value="Science Fiction">Science Fiction</Option>
                      <Option value="Fantasy">Fantasy</Option>
                      <Option value="Mystery">Mystery</Option>
                      <Option value="Romance">Romance</Option>
                      <Option value="Thriller">Thriller</Option>
                      <Option value="Biography">Biography</Option>
                      <Option value="History">History</Option>
                      <Option value="Self-Help">Self-Help</Option>
                      <Option value="Business">Business</Option>
                      <Option value="Technology">Technology</Option>
                      <Option value="Other">Other</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="condition"
                    label="Condition"
                    rules={[{ required: true, message: 'Please select the book condition' }]}
                  >
                    <Select
                      data-testid="book-condition-select"
                      placeholder="Select condition"
                    >
                      <Option value="Like New">Like New</Option>
                      <Option value="Very Good">Very Good</Option>
                      <Option value="Good">Good</Option>
                      <Option value="Fair">Fair</Option>
                      <Option value="Poor">Poor</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="description"
                label="Description (Optional)"
              >
                <TextArea
                  data-testid="book-description-input"
                  rows={4}
                  placeholder="Add any additional details about the book..."
                />
              </Form.Item>

              <Form.Item
                name="coverImageUrl"
                label="Cover Image URL (Optional)"
                rules={[{ type: 'url', warningOnly: true, message: 'Please enter a valid URL' }]}
              >
                <Input
                  data-testid="book-cover-url-input"
                  placeholder="https://example.com/cover.jpg"
                />
              </Form.Item>

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
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AddBook;

import React from 'react';
import { Form, Input, Select, Row, Col } from 'antd';
import { BookOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

const BookForm = ({ 
  form, 
  onFinish, 
  initialValues = {}, 
  showStatus = false,
  children 
}) => {
  return (
    <Form
      form={form}
      onFinish={onFinish}
      layout="vertical"
      size="large"
      className="space-y-4"
      initialValues={initialValues}
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
              allowClear
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
              allowClear
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

      {showStatus && (
        <Form.Item name="status" label="Status">
          <Select allowClear>
            <Option value="available">available</Option>
            <Option value="exchanged">exchanged</Option>
          </Select>
        </Form.Item>
      )}

      {children}
    </Form>
  );
};

export default BookForm;

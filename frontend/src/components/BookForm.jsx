import React from 'react';
import { Form, Input, Select, Row, Col } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import { BOOK_CONDITIONS, BOOK_GENRES } from '../constants/bookConstants';

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
              {BOOK_GENRES.map(genre => (
                <Option key={genre} value={genre}>{genre}</Option>
              ))}
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
              {BOOK_CONDITIONS.map(condition => (
                <Option key={condition} value={condition}>{condition}</Option>
              ))}
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

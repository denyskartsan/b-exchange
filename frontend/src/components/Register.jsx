import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message, Flex } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { authAPI } from '../utils/api';
import { useAuthStore } from '../stores';

const Register = () => {
  const { isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  // Handle error messages
  useEffect(() => {
    if (error) {
      message.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleSubmit = async (values) => {
    try {
      await authAPI.register(values);
      message.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      message.error(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <Flex justify="center" align="center" className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Join Book Exchange</h1>
          <p className="text-gray-600">Create your account</p>
        </div>
        
        <Form onFinish={handleSubmit} layout="vertical" size="large">
          <Form.Item
            name="name"
            rules={[{ required: true, message: 'Please enter your name' }]}
          >
            <Input
              data-testid="name-input"
              prefix={<UserOutlined />}
              placeholder="Full Name"
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input
              data-testid="email-input"
              prefix={<MailOutlined />}
              placeholder="Email"
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please enter your password' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
          >
            <Input.Password
              data-testid="password-input"
              prefix={<LockOutlined />}
              placeholder="Password"
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password
              data-testid="confirm-password-input"
              prefix={<LockOutlined />}
              placeholder="Confirm Password"
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item>
            <Button
              data-testid="register-button"
              type="primary"
              htmlType="submit"
              loading={isLoading}
              className="w-full rounded-lg h-12 text-lg font-medium"
            >
              Sign Up
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center">
          <span className="text-gray-600">Already have an account? </span>
          <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
            Sign in
          </Link>
        </div>
      </Card>
    </Flex>
  );
};

export default Register;

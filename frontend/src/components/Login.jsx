import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Form, Input, Button, Card, message, Flex } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { authAPI } from '../utils/api';
import { setToken, decodeToken } from '../utils/auth';
import { useAuthStore } from '../stores';

const Login = ({ onLogin }) => {
  const { isLoading, error, clearError } = useAuthStore();

  // Handle error messages
  useEffect(() => {
    if (error) {
      message.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleSubmit = async (values) => {
    try {
      const response = await authAPI.login(values);
      const { token } = response.data;
      setToken(token);
      const userData = decodeToken(token);
      onLogin(userData);
    } catch (error) {
      message.error(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <Flex justify="center" align="center" className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Book Exchange</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>
        
        <Form onFinish={handleSubmit} layout="vertical" size="large">
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input
              data-testid="email-input"
              prefix={<UserOutlined />}
              placeholder="Email"
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password
              data-testid="password-input"
              prefix={<LockOutlined />}
              placeholder="Password"
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item>
            <Button
              data-testid="login-button"
              type="primary"
              htmlType="submit"
              loading={isLoading}
              className="w-full rounded-lg h-12 text-lg font-medium"
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center">
          <span className="text-gray-600">Don't have an account? </span>
          <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium">
            Sign up
          </Link>
        </div>
      </Card>
    </Flex>
  );
};

export default Login;

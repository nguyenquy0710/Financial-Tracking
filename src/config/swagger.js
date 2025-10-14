const swaggerJsdoc = require('swagger-jsdoc');
const config = require('./config');

// Swagger definition and options for swagger-jsdoc setup
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'FinTrack API Documentation',
    version: `${(config.app.version ?? '1.0.0')}`,
    description:
      'FinTrack (Financial Tracking) – Người bạn đồng hành tài chính thông minh - Smart Financial Companion Platform',
    contact: {
      name: 'Nguyễn Hữu Quý',
      email: 'support@fintrack.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },

  // Define servers for different environments (Development, Production)
  servers: [
    {
      url: `http://localhost:${config.server.port}`,
      description: 'Development server'
    },
    {
      url: `${config.app.baseURL}`,
      description: 'Production server'
    }
  ],

  // Define security schemes for bearer token authentication
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token'
      }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'User ID'
          },
          name: {
            type: 'string',
            description: 'User name'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email'
          },
          role: {
            type: 'string',
            enum: ['user', 'admin'],
            description: 'User role'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp',
            $ref: '#/components/schemas/Timestamp'
          }
        }
      },
      Transaction: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Transaction ID'
          },
          user: {
            type: 'string',
            description: 'User ID'
          },
          type: {
            type: 'string',
            enum: ['income', 'expense'],
            description: 'Transaction type'
          },
          category: {
            type: 'string',
            description: 'Category ID'
          },
          amount: {
            type: 'number',
            description: 'Transaction amount'
          },
          description: {
            type: 'string',
            description: 'Transaction description'
          },
          date: {
            type: 'string',
            format: 'date-time',
            description: 'Transaction date'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp',
            $ref: '#/components/schemas/Timestamp'
          }
        }
      },
      Category: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Category ID'
          },
          name: {
            type: 'string',
            description: 'Category name'
          },
          type: {
            type: 'string',
            enum: ['income', 'expense'],
            description: 'Category type'
          },
          icon: {
            type: 'string',
            description: 'Category icon'
          },
          color: {
            type: 'string',
            description: 'Category color'
          }
        }
      },
      Budget: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Budget ID'
          },
          user: {
            type: 'string',
            description: 'User ID'
          },
          category: {
            type: 'string',
            description: 'Category ID'
          },
          amount: {
            type: 'number',
            description: 'Budget amount'
          },
          period: {
            type: 'string',
            enum: ['daily', 'weekly', 'monthly', 'yearly'],
            description: 'Budget period'
          },
          startDate: {
            type: 'string',
            format: 'date-time',
            description: 'Budget start date'
          },
          endDate: {
            type: 'string',
            format: 'date-time',
            description: 'Budget end date'
          }
        }
      },
      Goal: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Goal ID'
          },
          user: {
            type: 'string',
            description: 'User ID'
          },
          name: {
            type: 'string',
            description: 'Goal name'
          },
          targetAmount: {
            type: 'number',
            description: 'Target amount'
          },
          currentAmount: {
            type: 'number',
            description: 'Current amount saved'
          },
          deadline: {
            type: 'string',
            format: 'date-time',
            description: 'Goal deadline'
          },
          status: {
            type: 'string',
            enum: ['active', 'completed', 'cancelled'],
            description: 'Goal status'
          }
        }
      },
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          message: {
            type: 'string',
            description: 'Error message'
          }
        }
      },
      Success: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          data: {
            type: 'object',
            description: 'Response data'
          }
        }
      },
      VietQrBank: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            description: 'ID ngân hàng trong hệ thống VietQR, không phải ID của FinTrack'
          },
          name: {
            type: 'string',
            description: 'Tên pháp nhân ngân hàng (theo giấy phép hoạt động)'
          },
          code: {
            type: 'string',
            description: 'Tên mã ngân hàng (theo chuẩn ISO 9362 - BIC)'
          },
          bin: {
            type: 'string',
            description: 'Mã ngân hàng, sử dụng mã này trong Quick Link của VietQR'
          },
          shortName: {
            type: 'string',
            description: 'Tên ngắn gọn thường gọi của ngân hàng (trong giao dịch chuyển tiền)'
          },
          logo: {
            type: 'string',
            description: '	Đường dẫn tới logo ngân hàng (trong hệ thống của FinTrack)'
          },
          transferSupported: {
            type: 'number',
            description:
              'App của Bank hỗ trợ chuyển tiền bằng cách quét mã VietQR hay không, 1: hỗ trợ, 0: không hỗ trợ'
          },
          lookupSupported: {
            type: 'number',
            description:
              'Số tài khoản của Bank có thể tra cứu bằng API tra cứu số tài khoản hay không, 1: hỗ trợ, 0: không hỗ trợ'
          }
        }
      }
    }
  },

  // Global security requirement - all endpoints require bearer token unless otherwise specified
  security: [
    {
      bearerAuth: []
    }
  ]
};

// Options for swagger-jsdoc - paths to files containing OpenAPI definitions
const options = {
  swaggerDefinition,
  apis: [
    './src/routes/*.js',
    './src/routes/apis/*.js',
    './src/routes/admin/*.js',
    './src/controllers/*.js',
    './src/models/*.js'
  ]
};

// Initialize swagger-jsdoc -> returns validated swagger spec in json format
const swaggerSpec = swaggerJsdoc(options);

// Export the swagger specification to be used in index.js
module.exports = swaggerSpec;

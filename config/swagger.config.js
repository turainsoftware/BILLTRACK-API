const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Billtrack - BILLING MANAGEMENT SOFTWARE",
      version: "1.0.0",
      description: `API for BillTrack.
      
**Project**: Billtrack  
**Company**: Turain Software Private Limited  
**Developer**: GREAT DEVELOPER PRITAM BALA`,
      contact: {
        name: "API Support",
        email: "jhantu.developer@gmail.com",
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}/api/v1`,
        description: "Development server",
      },
    ],
    components: {
      schemas: {
        Hsn: {
          type: "object",
          required: ["hsnCode", "description"],
          properties: {
            id: {
              type: "integer",
              description: "Auto-generated unique identifier",
            },
            hsnCode: {
              type: "string",
              description: "Unique HSN code",
            },
            description: {
              type: "string",
              description: "Description of the HSN code",
            },
            cGst: {
              type: "number",
              format: "float",
              minimum: 0,
              maximum: 100,
              description: "Central GST rate percentage",
            },
            sGst: {
              type: "number",
              format: "float",
              minimum: 0,
              maximum: 100,
              description: "State GST rate percentage",
            },
            iGst: {
              type: "number",
              format: "float",
              minimum: 0,
              maximum: 100,
              description: "Integrated GST rate percentage",
            },
            isActive: {
              type: "boolean",
              description: "Active status of the HSN code",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Error message",
            },
            status: {
              type: "boolean",
              description: "Success status",
            },
          },
        },
      },
      parameters: {
        idParam: {
          in: "path",
          name: "id",
          required: true,
          schema: {
            type: "integer",
          },
          description: "HSN record ID",
        },
        hsnCodeParam: {
          in: "path",
          name: "code",
          required: true,
          schema: {
            type: "string",
          },
          description: "HSN code",
        },
        formatParam: {
          in: "path",
          name: "format",
          required: true,
          schema: {
            type: "string",
            enum: ["json", "csv", "excel"],
          },
          description: "Export format",
        },
      },
    },
  },
  apis: ["./routers/*.js", "./controllers/*.js"], // Path to the API docs
};

const specs = swaggerJsdoc(options);

module.exports = { specs, swaggerUi };

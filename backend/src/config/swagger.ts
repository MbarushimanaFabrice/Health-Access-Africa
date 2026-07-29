import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Health Access Africa API',
      version: '1.0.0',
      description:
        'REST API for Health Access Africa — a digital health platform connecting patients in rural/underserved Rwanda with healthcare providers via telehealth consultations, appointment booking, and health information access.',
      contact: {
        name: 'Fabrice Mbarushimana',
        email: 'admin@healthaccessafrica.rw',
      },
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer {token}',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            fullName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['patient', 'doctor', 'admin'] },
            phone: { type: 'string', nullable: true },
            district: { type: 'string', nullable: true },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        DoctorProfile: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            specialty: { type: 'string', nullable: true },
            hospital: { type: 'string', nullable: true },
            bio: { type: 'string', nullable: true },
            yearsExperience: { type: 'integer', nullable: true },
          },
        },
        PatientProfile: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            dateOfBirth: { type: 'string', format: 'date', nullable: true },
            gender: { type: 'string', nullable: true },
            allergies: { type: 'string', nullable: true },
            chronicConditions: { type: 'string', nullable: true },
            notes: { type: 'string', nullable: true },
          },
        },
        Appointment: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            patientId: { type: 'string', format: 'uuid' },
            doctorId: { type: 'string', format: 'uuid' },
            appointmentDate: { type: 'string', format: 'date' },
            appointmentTime: { type: 'string', example: '09:00' },
            reason: { type: 'string', nullable: true },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'cancelled', 'completed'],
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Consultation: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            appointmentId: { type: 'string', format: 'uuid' },
            notes: { type: 'string', nullable: true },
            status: {
              type: 'string',
              enum: ['not_started', 'in_progress', 'completed'],
            },
            startedAt: { type: 'string', format: 'date-time', nullable: true },
            endedAt: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        HealthInfo: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            content: { type: 'string' },
            category: { type: 'string', nullable: true },
            authorId: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            message: { type: 'string' },
            type: { type: 'string' },
            isRead: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string' },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
          },
        },
      },
    },
    security: [{ BearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'User registration, login, and profile' },
      { name: 'Users', description: 'User lookup and listing' },
      { name: 'Appointments', description: 'Appointment booking and management' },
      { name: 'Consultations', description: 'Telehealth consultation management' },
      { name: 'Patients', description: 'Patient medical profile management' },
      { name: 'HealthInfo', description: 'Health information articles' },
      { name: 'Notifications', description: 'User notifications' },
      { name: 'Admin', description: 'Admin dashboard and user management' },
    ],
  },
  apis: ['./src/modules/**/*.routes.ts', './src/modules/**/*.controller.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express): void {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss: '.swagger-ui .topbar { background-color: #1a6b4a; }',
      customSiteTitle: 'Health Access Africa API Docs',
      swaggerOptions: {
        persistAuthorization: true,
      },
    })
  );

  // Expose raw swagger JSON
  app.get('/api-docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log('Swagger UI available at http://localhost:4000/api-docs');
}

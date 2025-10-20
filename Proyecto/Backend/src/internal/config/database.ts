import { Sequelize } from 'sequelize';
import User from '../domain/user.model';
import Product from '../domain/product.model';
import ChatbotSession from '../domain/chatbotSession.model';
import ChatbotMessage from '../domain/chatbotMessage.model';

export const sequelize = new Sequelize(
  process.env.DB_NAME || 'heisenberg_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    dialect: 'mysql',
    logging: process.env.NODE_ENV !== 'production'? true : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// Database migration function
export const syncDatabase = async (): Promise<void> => {
  try {

    await sequelize.sync({ force: true });
    console.log('Database synchronized (tables recreated).');

  } catch (error) {
    
    console.error('Unable to connect to the database:', error);
    throw error;

  }
};

// Seed data function
export const seedDatabase = async (): Promise<void> => {
  try {

    // Seed Users
    const users = await User.bulkCreate([
      {
        username: 'admin',
        email: 'admin@heisenberg.com',
        password_hash: '$2b$10$dummyHashForAdminUser123456789',
        role: 'admin',
      },
      {
        username: 'user_demo',
        email: 'demo@heisenberg.com',
        password_hash: '$2b$10$dummyHashForDemoUser123456789',
        role: 'user',
      },
    ]);

    // Seed Products
    await Product.bulkCreate([
      {
        name: 'Paracetamol 500mg',
        type: 'Analgésico',
        use_case: 'Alivio del dolor leve a moderado y reducción de la fiebre.',
        warnings: 'No exceder la dosis recomendada. Puede causar daño hepático en caso de sobredosis.',
        contraindications: 'Hipersensibilidad al paracetamol, enfermedad hepática grave.',
        expiration_date: '2026-12-31',
        price: 5.99,
        stock: 100,
      },
      {
        name: 'Ibuprofeno 400mg',
        type: 'Antiinflamatorio',
        use_case: 'Tratamiento del dolor, inflamación y fiebre.',
        warnings: 'Tomar con alimentos para evitar molestias gástricas.',
        contraindications: 'Úlcera péptica activa, insuficiencia renal grave, tercer trimestre de embarazo.',
        expiration_date: '2027-06-30',
        price: 8.50,
        stock: 75,
      },
      {
        name: 'Amoxicilina 500mg',
        type: 'Antibiótico',
        use_case: 'Tratamiento de infecciones bacterianas.',
        warnings: 'Completar el tratamiento completo según prescripción médica.',
        contraindications: 'Alergia a penicilinas o cefalosporinas.',
        expiration_date: '2025-08-15',
        price: 12.00,
        stock: 50,
      },
      {
        name: 'Loratadina 10mg',
        type: 'Antihistamínico',
        use_case: 'Alivio de síntomas de alergias como rinitis y urticaria.',
        warnings: 'Puede causar somnolencia en algunas personas.',
        contraindications: 'Hipersensibilidad a la loratadina.',
        expiration_date: '2026-03-20',
        price: 6.75,
        stock: 120,
      },
    ]);

    // Seed Chatbot Sessions
    const user1Id = users[0]?.get('id') as number;
    const user2Id = users[1]?.get('id') as number;
    const sessions = await ChatbotSession.bulkCreate([
      {
        user_id: user1Id,
        is_active: true,
      },
      {
        user_id: user2Id,
        is_active: false,
      },
    ]);

    // Seed Chatbot Messages
    const session1Id = sessions[0]?.get('id') as number;
    const session2Id = sessions[1]?.get('id') as number;
    await ChatbotMessage.bulkCreate([
      {
        session_id: session1Id,
        sender: 'user',
        message: '¿Qué medicamento me recomiendas para el dolor de cabeza?',
      },
      {
        session_id: session1Id,
        sender: 'bot',
        message: 'Para el dolor de cabeza leve a moderado, te recomiendo Paracetamol 500mg o Ibuprofeno 400mg. ¿Tienes alguna alergia a medicamentos?',
      },
      {
        session_id: session2Id,
        sender: 'user',
        message: 'Necesito información sobre antibióticos',
      },
      {
        session_id: session2Id,
        sender: 'bot',
        message: 'Los antibióticos como la Amoxicilina 500mg deben ser recetados por un médico. Es importante completar el tratamiento completo. ¿Tienes una prescripción médica?',
      },
    ]);

    console.log('Database seeded successfully with sample data!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};


export const initDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    if(process.env.NODE_ENV !== 'production') {
      await syncDatabase();
    }
    
    if (process.env.NODE_ENV !== 'production') {
      await seedDatabase();
    }
    
    await sequelize.close();
    
  } catch (error) {
    console.error('Database initialization failed:', error);
    await sequelize.close();
    throw error;
  }
};


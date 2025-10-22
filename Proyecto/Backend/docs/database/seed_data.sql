-- Insert data into user
INSERT INTO user (username, email, password_hash, role, created_at) VALUES 
    ('admin', 'admin@heisenberg.com', '$2b$10$dummyHashForAdminUser123456789', 'admin', NOW()), 
    ('user_demo', 'demo@heisenberg.com', '$2b$10$dummyHashForDemoUser123456789', 'user', NOW());

-- Insert data into product
INSERT INTO product (name, type, use_case, warnings, contraindications, expiration_date, price, stock, created_at) VALUES
    ('Paracetamol 500mg', 'Analgésico', 'Alivia el dolor leve a moderado y reduce la fiebre.', 'No exceder la dosis recomendada. Puede causar daño hepático en caso de sobredosis.', 'Hipersensibilidad al paracetamol o enfermedad hepática grave.', '2026-12-31', 5.99, 100, NOW()),
    ('Ibuprofeno 400mg', 'Antiinflamatorio', 'Tratamiento del dolor, la inflamación y la fiebre.', 'Tomar con alimentos para evitar molestias estomacales.', 'Úlcera péptica activa, insuficiencia renal grave, tercer trimestre de embarazo.', '2027-06-30', 8.50, 75, NOW()),
    ('Amoxicilina 500mg', 'Antibiótico', 'Tratamiento de infecciones bacterianas.', 'Completar todo el tratamiento según la prescripción médica.', 'Alergia a penicilinas o cefalosporinas.', '2025-08-15', 12.00, 50, NOW()),
    ('Loratadina 10mg', 'Antihistamínico', 'Alivia los síntomas de alergias como la rinitis y la urticaria.', 'Puede causar somnolencia en algunas personas.', 'Hipersensibilidad a la loratadina.', '2026-03-20', 6.75, 120, NOW());

-- Insert data into chatbot_session
INSERT INTO chatbot_session (user_id, is_active) SELECT id, TRUE FROM user WHERE username = 'admin';
INSERT INTO chatbot_session (user_id, is_active) SELECT id, FALSE FROM user WHERE username = 'user_demo';

-- Insert data into chatbot_message
INSERT INTO chatbot_message (session_id, sender, message, created_at) VALUES 
    (1, 'user', '¿Qué medicamento me recomiendas para el dolor de cabeza?', NOW()),
    (1, 'bot', 'Para el dolor de cabeza leve a moderado, te recomiendo Paracetamol 500mg o Ibuprofeno 400mg. ¿Tienes alguna alergia a medicamentos?', NOW()),
    (2, 'user', 'Necesito información sobre antibióticos', NOW()),
    (2, 'bot', 'Los antibióticos como la Amoxicilina 500mg deben ser recetados por un médico. Es importante completar el tratamiento completo. ¿Tienes una prescripción médica?', NOW());

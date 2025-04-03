import axios from 'axios';
const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3Mzg4NTI2MjMsImV4cCI6MTc0MTQ0NDYyMywiYXVkIjoiaHR0cHM6Ly93d3cucGFuaWMtYXBwLmRlc2l0c2EuY29tIiwiaXNzIjoiaHR0cHM6Ly93d3cuZGVzaXRzYS5jb20iLCJzdWIiOiI1NzczYWYwNy02NzJkNDgxOS1hYzc2YTAwZS01ZDc4YjdjMiJ9.IaNia_Q_CRcQdfyl4aZf7oLjP0g8TMUt3FJmtDarqZw';

// Define la URL base
const AP = "https://desit-server-staging-2dab81ac495c.herokuapp.com/api/v1/event";

// Función para hacer un POST con el token
export const savePost = async (newPost) => {
  return await axios.post(AP, newPost, {
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`, // Agregar el token en los headers
      'Content-Type': 'application/json' // Asegurar que se envían datos en formato JSON
    }
  });
};

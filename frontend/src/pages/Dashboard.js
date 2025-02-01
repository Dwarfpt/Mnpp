// frontend/src/pages/Dashboard.js
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../components/AuthContext';
import axios from 'axios';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';

const Dashboard = () => {
  const { auth } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
        if (auth.token) {
            try {
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/auth/me`, {  // Убрали /api/
                    headers: {
                        Authorization: `Bearer ${auth.token}`
                    }
                });
                setUserData(res.data);
            } catch (err) {
                console.error(err);
                setError('Не удалось получить данные пользователя.');
            }
        }
    };
    fetchUser();
}, [auth.token]);

  if (error) return <Alert variant="danger" className="mt-5 text-center">{error}</Alert>;
  if (!userData) return (
    <Container className="mt-5 text-center">
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Загрузка...</span>
      </Spinner>
    </Container>
  );

  return (
    <Container className="mt-5">
        <Row className="justify-content-md-center">
            <Col md={8}>
                <Card>
                    <Card.Header>
                        <h3>Личный кабинет</h3>
                    </Card.Header>
                    <Card.Body>
                        <p><strong>Имя пользователя:</strong> {userData.username}</p>
                        <p><strong>Email:</strong> {userData.email}</p>
                        <p><strong>Роль:</strong> {userData.role}</p>
                        <p><strong>Баланс:</strong> {userData.balance || 0} ₽</p>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    </Container>
);
};

export default Dashboard;

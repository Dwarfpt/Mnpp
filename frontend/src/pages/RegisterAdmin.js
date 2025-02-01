// frontend/src/pages/RegisterAdmin.js
import React, { useState, useContext } from 'react';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import axios from 'axios';
import { AuthContext } from '../components/AuthContext';

const RegisterAdmin = () => {
    const { auth } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const { username, email, password } = formData;

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Простая валидация
        if (!username || !email || !password) {
            setError('Пожалуйста, заполните все поля.');
            return;
        }

        try {
            const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/register-admin`, formData, {
                headers: {
                    Authorization: `Bearer ${auth.token}`,
                    'Content-Type': 'application/json'
                }
            });
            setSuccess('Администратор успешно зарегистрирован.');
            setFormData({
                username: '',
                email: '',
                password: ''
            });
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Не удалось зарегистрировать администратора.');
        }
    };

    return (
        <Container className="mt-5">
            <Row className="justify-content-md-center">
                <Col md={6}>
                    <Card>
                        <Card.Header>
                            <h3>Регистрация Администратора</h3>
                        </Card.Header>
                        <Card.Body>
                            {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
                            {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}
                            <Form onSubmit={onSubmit}>
                                <Form.Group className="mb-3" controlId="formUsername">
                                    <Form.Label>Имя пользователя</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Введите имя пользователя"
                                        name="username"
                                        value={username}
                                        onChange={onChange}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formEmail">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="Введите email"
                                        name="email"
                                        value={email}
                                        onChange={onChange}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formPassword">
                                    <Form.Label>Пароль</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Введите пароль"
                                        name="password"
                                        value={password}
                                        onChange={onChange}
                                        required
                                    />
                                </Form.Group>

                                <Button variant="primary" type="submit">
                                    Зарегистрировать Администратора
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default RegisterAdmin;

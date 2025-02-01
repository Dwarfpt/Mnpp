// frontend/src/pages/ContactUs.js
import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import axios from 'axios';

const ContactUs = () => {
    const [form, setForm] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            // Предполагается, что у вас есть соответствующий эндпоинт для обработки контактов
            const res = await axios.post(`${process.env.REACT_APP_API_URL}/contact`, form, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            setSuccess('Ваше сообщение успешно отправлено!');
            setError('');
            setForm({ name: '', email: '', message: '' });
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Серверная ошибка');
            setSuccess('');
        }
    };

    return (
        <Container className="mt-5">
            <Row className="justify-content-md-center">
                <Col md={8}>
                    <Card>
                        <Card.Body>
                            <Card.Title className="text-center">Свяжитесь с нами</Card.Title>
                            {success && <Alert variant="success">{success}</Alert>}
                            {error && <Alert variant="danger">{error}</Alert>}
                            <Form onSubmit={onSubmit}>
                                <Form.Group className="mb-3" controlId="formName">
                                    <Form.Label>Имя</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        name="name" 
                                        value={form.name} 
                                        onChange={onChange} 
                                        placeholder="Введите ваше имя" 
                                        required 
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formEmail">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control 
                                        type="email" 
                                        name="email" 
                                        value={form.email} 
                                        onChange={onChange} 
                                        placeholder="Введите ваш email" 
                                        required 
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formMessage">
                                    <Form.Label>Сообщение</Form.Label>
                                    <Form.Control 
                                        as="textarea" 
                                        rows={5} 
                                        name="message" 
                                        value={form.message} 
                                        onChange={onChange} 
                                        placeholder="Введите ваше сообщение" 
                                        required 
                                    />
                                </Form.Group>

                                <Button variant="primary" type="submit" className="w-100">
                                    Отправить
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ContactUs;

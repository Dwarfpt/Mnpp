import React, { useState, useContext } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../components/AuthContext';

const Register = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });
    const [verificationStep, setVerificationStep] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [userId, setUserId] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const { username, email, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/register`, {
                username,
                email,
                password
            });
            
            console.log('Registration response:', response.data);
            
            setUserId(response.data.userId);
            setVerificationStep(true);
            setSuccess('Код подтверждения отправлен на ваш email');
        } catch (err) {
            console.error('Registration error:', err.response?.data || err);
            setError(err.response?.data?.message || 'Ошибка при регистрации.');
        }
    };

    const handleVerification = async e => {
        e.preventDefault();
        try {
            const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/verify`, {
                email,
                code: verificationCode
            });
            login(res.data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка при подтверждении кода.');
        }
    };

    if (verificationStep) {
        return (
            <Container className="mt-5" style={{ maxWidth: '500px' }}>
                <h2>Подтверждение Email</h2>
                {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
                {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}
                <Form onSubmit={handleVerification}>
                    <Form.Group className="mb-3">
                        <Form.Label>Введите код подтверждения</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Введите код из email"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit">
                        Подтвердить
                    </Button>
                </Form>
            </Container>
        );
    }

    return (
        <Container className="mt-5" style={{ maxWidth: '500px' }}>
            <h2>Регистрация</h2>
            {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
            {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}
            <Form onSubmit={onSubmit}>
                <Form.Group className="mb-3">
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
                <Form.Group className="mb-3">
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
                <Form.Group className="mb-3">
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
                    Зарегистрироваться
                </Button>
            </Form>
        </Container>
    );
};

export default Register;
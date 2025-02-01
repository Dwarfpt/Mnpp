import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Table, Button, Modal, Alert, Form, Tabs, Tab, Spinner } from 'react-bootstrap';
import { AuthContext } from '../components/AuthContext';
import axios from 'axios';

const AdminPanel = () => {
    const { auth } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [userCarts, setUserCarts] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showBalanceModal, setShowBalanceModal] = useState(false);
    const [balanceAmount, setBalanceAmount] = useState('');
    const [showCartModal, setShowCartModal] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [newRole, setNewRole] = useState('user');
    const [showCreateUserModal, setShowCreateUserModal] = useState(false);
    
    const [newUser, setNewUser] = useState({
        username: '',
        email: '',
        password: '',
        role: 'user'
    });
    const [newProduct, setNewProduct] = useState({
        name: '',
        description: '',
        price: '',
        imageUrl: ''
    });

// Исправить URL в fetchUsers
const fetchUsers = async () => {
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/users`, {  // Убрали /api/
            headers: { Authorization: `Bearer ${auth.token}` }
        });
        setUsers(response.data);
        setLoading(false);
    } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Ошибка при загрузке пользователей');
        setLoading(false);
    }
};

// Исправить URL в handleUpdateBalance
const handleUpdateBalance = async () => {
    try {
        const response = await axios.put(
            `${process.env.REACT_APP_API_URL}/users/balance/${selectedUser._id}`,  // Убрали /api/
            { amount: Number(balanceAmount) },
            { headers: { Authorization: `Bearer ${auth.token}` }}
        );
        setSuccess('Баланс успешно обновлен');
        fetchUsers();
        setShowBalanceModal(false);
    } catch (err) {
        setError(err.response?.data?.message || 'Ошибка при обновлении баланса');
    }
};

    // Загрузка товаров
    const fetchProducts = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/products`, {
                headers: { Authorization: `Bearer ${auth.token}` }
            });
            setProducts(response.data);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Ошибка при загрузке товаров');
        }
    };

    // Получение корзины конкретного пользователя
    const fetchUserCart = async (userId) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/cart/user/${userId}`, {
                headers: { Authorization: `Bearer ${auth.token}` }
            });
            setUserCarts(prev => ({
                ...prev,
                [userId]: response.data
            }));
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Ошибка при загрузке корзины пользователя');
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchProducts();
    }, []);

    // Обработчики модальных окон
    const handleShowCart = async (user) => {
        setSelectedUser(user);
        if (!userCarts[user._id]) {
            await fetchUserCart(user._id);
        }
        setShowCartModal(true);
    };

    const handleShowRoleModal = (user) => {
        setSelectedUser(user);
        setNewRole(user.role);
        setShowRoleModal(true);
    };

    // Обработка изменения роли
    const handleRoleChange = async () => {
        try {
            await axios.put(
                `${process.env.REACT_APP_API_URL}/users/${selectedUser._id}/role`,
                { role: newRole },
                {
                    headers: {
                        Authorization: `Bearer ${auth.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            setSuccess('Роль успешно изменена');
            setShowRoleModal(false);
            fetchUsers();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Ошибка при изменении роли');
        }
    };

    // Обработка создания нового пользователя
    const handleCreateUser = async () => {
        try {
            await axios.post(
                `${process.env.REACT_APP_API_URL}/users`,
                { ...newUser, isVerified: true }, // Добавляем флаг isVerified
                {
                    headers: {
                        Authorization: `Bearer ${auth.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            setSuccess('Пользователь успешно создан');
            setShowCreateUserModal(false);
            setNewUser({ username: '', email: '', password: '', role: 'user' });
            fetchUsers();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Ошибка при создании пользователя');
        }
    };

    // Обработка создания нового товара
    const handleCreateProduct = async (e) => {
        e.preventDefault();
        try {
            await axios.post(
                `${process.env.REACT_APP_API_URL}/products`,
                newProduct,
                {
                    headers: {
                        Authorization: `Bearer ${auth.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            setSuccess('Товар успешно добавлен');
            setNewProduct({ name: '', description: '', price: '', imageUrl: '' });
            fetchProducts();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Ошибка при добавлении товара');
        }
    };

    // Обработка удаления товара
    const handleDeleteProduct = async (productId) => {
        if (window.confirm('Вы уверены, что хотите удалить этот товар?')) {
            try {
                await axios.delete(
                    `${process.env.REACT_APP_API_URL}/products/${productId}`,
                    {
                        headers: { Authorization: `Bearer ${auth.token}` }
                    }
                );
                setSuccess('Товар успешно удален');
                fetchProducts();
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.message || 'Ошибка при удалении товара');
            }
        }
    };

    if (loading) {
        return (
            <Container className="mt-5 text-center">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Загрузка...</span>
                </Spinner>
            </Container>
        );
    }

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
            try {
                await axios.delete(
                    `${process.env.REACT_APP_API_URL}/users/${userId}`,
                    { headers: { Authorization: `Bearer ${auth.token}` }}
                );
                setSuccess('Пользователь успешно удален');
                fetchUsers();
            } catch (err) {
                setError(err.response?.data?.message || 'Ошибка при удалении пользователя');
            }
        }
    };

    const handleShowBalanceModal = (user) => {
        setSelectedUser(user);
        setBalanceAmount('');
        setShowBalanceModal(true);
    };
    
    const handleShowUserCart = async (userId) => {
        const user = users.find(u => u._id === userId);
        setSelectedUser(user);
        await fetchUserCart(userId);
        setShowCartModal(true);
    };

    return (
        <Container className="mt-5">
            <h2>Панель администратора</h2>
            
            {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
            {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

            <Tabs defaultActiveKey="users" className="mb-3">
                <Tab eventKey="users" title="Пользователи">
                    <Button 
                        variant="success" 
                        className="mb-3"
                        onClick={() => setShowCreateUserModal(true)}
                    >
                        Создать пользователя
                    </Button>

                    <Table striped bordered hover>
        <thead>
            <tr>
                <th>ID</th>
                <th>Имя пользователя</th>
                <th>Email</th>
                <th>Роль</th>
                <th>Баланс</th>
                <th>Действия</th>
            </tr>
        </thead>
        <tbody>
            {users.map(user => (
                <tr key={user._id}>
                    <td>{user._id}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{user.balance || 0} ₽</td>
                    <td>
                        <Button 
                            variant="warning" 
                            size="sm" 
                            onClick={() => handleShowBalanceModal(user)}
                            className="me-2"
                        >
                            Изменить баланс
                        </Button>
                        <Button 
                            variant="danger" 
                            size="sm" 
                            onClick={() => handleDeleteUser(user._id)}
                            className="me-2"
                        >
                            Удалить
                        </Button>
                        <Button 
                            variant="info" 
                            size="sm" 
                            onClick={() => handleShowUserCart(user._id)}
                        >
                            Корзина
                        </Button>
                    </td>
                </tr>
            ))}
        </tbody>
    </Table>
                </Tab>

                <Tab eventKey="products" title="Товары">
                    <Form onSubmit={handleCreateProduct} className="mb-4">
                        <Row>
                            <Col md={3}>
                                <Form.Group className="mb-3">
                                    <Form.Control
                                        type="text"
                                        placeholder="Название товара"
                                        value={newProduct.name}
                                        onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group className="mb-3">
                                    <Form.Control
                                        type="text"
                                        placeholder="Описание"
                                        value={newProduct.description}
                                        onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={2}>
                                <Form.Group className="mb-3">
                                    <Form.Control
                                        type="number"
                                        placeholder="Цена"
                                        value={newProduct.price}
                                        onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group className="mb-3">
                                    <Form.Control
                                        type="text"
                                        placeholder="URL изображения"
                                        value={newProduct.imageUrl}
                                        onChange={(e) => setNewProduct({...newProduct, imageUrl: e.target.value})}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={1}>
                                <Button type="submit" variant="success">
                                    Добавить
                                </Button>
                            </Col>
                        </Row>
                    </Form>

                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Название</th>
                                <th>Описание</th>
                                <th>Цена</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product._id}>
                                    <td>{product._id}</td>
                                    <td>{product.name}</td>
                                    <td>{product.description}</td>
                                    <td>{product.price} ₽</td>
                                    <td>
                                        <Button 
                                            variant="danger" 
                                            size="sm"
                                            onClick={() => handleDeleteProduct(product._id)}
                                        >
                                            Удалить
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Tab>
            </Tabs>
            {/* Модальное окно для пополнения баланса */}
            <Modal show={showBalanceModal} onHide={() => setShowBalanceModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        Пополнение баланса пользователя {selectedUser?.username}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Сумма пополнения</Form.Label>
                            <Form.Control
                                type="number"
                                value={balanceAmount}
                                onChange={(e) => setBalanceAmount(e.target.value)}
                                placeholder="Введите сумму"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowBalanceModal(false)}>
                        Отмена
                    </Button>
                    <Button variant="primary" onClick={handleUpdateBalance}>
                        Пополнить
                    </Button>
                </Modal.Footer>
            </Modal>
            {/* Модальное окно для просмотра корзины */}
            <Modal 
                show={showCartModal} 
                onHide={() => setShowCartModal(false)}
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        Корзина пользователя {selectedUser?.username}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedUser && userCarts[selectedUser._id]?.items?.length > 0 ? (
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Название товара</th>
                                    <th>Количество</th>
                                    <th>Цена за единицу</th>
                                    <th>Общая стоимость</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userCarts[selectedUser._id].items.map(item => (
                                    <tr key={item.product._id}>
                                        <td>{item.product.name}</td>
                                        <td>{item.quantity}</td>
                                        <td>{item.product.price} ₽</td>
                                        <td>{item.product.price * item.quantity} ₽</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : (
                        <Alert variant="info">
                            Корзина пользователя пуста
                        </Alert>
                    )}
                </Modal.Body>
            </Modal>

            {/* Модальное окно для изменения роли */}
            <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Изменить роль пользователя</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Роль</Form.Label>
                        <Form.Control
                            as="select"
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                        >
                            <option value="user">Пользователь</option>
                            <option value="admin">Администратор</option>
                        </Form.Control>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowRoleModal(false)}>
                        Отмена
                    </Button>
                    <Button variant="primary" onClick={handleRoleChange}>
                        Сохранить
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Модальное окно для создания пользователя */}
            <Modal show={showCreateUserModal} onHide={() => setShowCreateUserModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Создать нового пользователя</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Имя пользователя</Form.Label>
                            <Form.Control
                                type="text"
                                value={newUser.username}
                                onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                value={newUser.email}
                                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Пароль</Form.Label>
                            <Form.Control
                                type="password"
                                value={newUser.password}
                                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Роль</Form.Label>
                            <Form.Control
                                as="select"
                                value={newUser.role}
                                onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                            >
                                <option value="user">Пользователь</option>
                                <option value="admin">Администратор</option>
                            </Form.Control>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCreateUserModal(false)}>
                        Отмена
                    </Button>
                    <Button variant="primary" onClick={handleCreateUser}>
                        Создать
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default AdminPanel;
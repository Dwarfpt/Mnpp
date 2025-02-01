import React, { useState, useContext, useEffect } from 'react';
import { Container, Button, Alert, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/AuthContext';
import axios from 'axios';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { auth, updateUserData } = useContext(AuthContext);
    const navigate = useNavigate();
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [userBalance, setUserBalance] = useState(0);
    const [shippingAddress, setShippingAddress] = useState({
        street: '',
        city: '',
        postalCode: ''
    });

    const fetchCart = async () => {
      try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/cart`, {  // Убрали /api/
              headers: { 
                  'Authorization': `Bearer ${auth.token}`,
                  'Content-Type': 'application/json'
              }
          });
          setCartItems(response.data.items || []);
          setLoading(false);
      } catch (err) {
          console.error('Error fetching cart:', err);
          setError(err.response?.data?.message || 'Ошибка при загрузке корзины');
          setLoading(false);
      }
  };
  
  const fetchUserData = async () => {
      try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/me`, {  // Убрали /api/
              headers: { Authorization: `Bearer ${auth.token}` }
          });
          setUserBalance(response.data.balance || 0);
      } catch (err) {
          console.error('Ошибка при получении данных пользователя:', err);
      }
  };

    useEffect(() => {
        if (!auth.token) {
            navigate('/login');
            return;
        }
        fetchCart();
        fetchUserData();
    }, [auth.token, navigate]);

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => {
            return total + (item.product.price * item.quantity);
        }, 0);
    };

    const handleOrder = async () => {
      try {
          // Сначала проверяем баланс
          const total = calculateTotal();
          if (total > userBalance) {
              setError('Недостаточно средств для оформления заказа');
              return;
          }
  
          await axios.post(
              `${process.env.REACT_APP_API_URL}/orders`,
              { shippingAddress },
              { headers: { Authorization: `Bearer ${auth.token}` }}
          );
  
          setShowOrderModal(false);
          setSuccess('Заказ успешно оформлен');
          
          // Обновляем данные в правильном порядке
          await updateUserData(); // Сначала обновляем контекст
          await fetchUserData(); // Затем локальное состояние
          await fetchCart(); // И наконец корзину
          
      } catch (err) {
          console.error('Order error:', err);
          setError(err.response?.data?.message || 'Ошибка при оформлении заказа');
      }
  };

    if (loading) {
        return <Container className="mt-5">Загрузка...</Container>;
    }

    return (
        <Container className="mt-5">
            <h2>Корзина</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            
            {cartItems.length === 0 ? (
                <Alert variant="info">Ваша корзина пуста</Alert>
            ) : (
                <>
                    {cartItems.map(item => (
                        <div key={item.product._id} className="mb-3 p-3 border rounded">
                            <h5>{item.product.name}</h5>
                            <p>Цена: {item.product.price} ₽</p>
                            <p>Количество: {item.quantity}</p>
                        </div>
                    ))}
                    
                    <div className="mt-4">
                        <h5>Ваш баланс: {userBalance} ₽</h5>
                        <h5>Итого к оплате: {calculateTotal()} ₽</h5>
                        
                        <Button 
                            variant="primary"
                            onClick={() => setShowOrderModal(true)}
                            disabled={calculateTotal() > userBalance || cartItems.length === 0}
                        >
                            Оформить заказ
                        </Button>
                        
                        {calculateTotal() > userBalance && (
                            <Alert variant="warning" className="mt-3">
                                Недостаточно средств для оформления заказа
                            </Alert>
                        )}
                    </div>
                </>
            )}

            <Modal show={showOrderModal} onHide={() => setShowOrderModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Оформление заказа</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Улица</Form.Label>
                            <Form.Control
                                type="text"
                                value={shippingAddress.street}
                                onChange={(e) => setShippingAddress({
                                    ...shippingAddress,
                                    street: e.target.value
                                })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Город</Form.Label>
                            <Form.Control
                                type="text"
                                value={shippingAddress.city}
                                onChange={(e) => setShippingAddress({
                                    ...shippingAddress,
                                    city: e.target.value
                                })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Почтовый индекс</Form.Label>
                            <Form.Control
                                type="text"
                                value={shippingAddress.postalCode}
                                onChange={(e) => setShippingAddress({
                                    ...shippingAddress,
                                    postalCode: e.target.value
                                })}
                                required
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowOrderModal(false)}>
                        Отмена
                    </Button>
                    <Button variant="primary" onClick={handleOrder}>
                        Подтвердить заказ
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Cart;
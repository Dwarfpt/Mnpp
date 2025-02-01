import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../components/AuthContext';

const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/products`);
      setProducts(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Не удалось загрузить товары.');
      setLoading(false);
    }
  };

  const addToCart = async (product) => {
    if (!auth.token) {
        alert('Для добавления товаров в корзину необходимо войти в аккаунт');
        navigate('/login');
        return;
    }
    
    try {
        await axios.post(
            `${process.env.REACT_APP_API_URL}/cart/add`,
            { productId: product._id, quantity: 1 },
            {
                headers: {
                    'Authorization': `Bearer ${auth.token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        alert('Товар добавлен в корзину!');
    } catch (err) {
        console.error('Error adding to cart:', err);
        alert(err.response?.data?.message || 'Ошибка при добавлении товара в корзину');
    }
};

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Row>
        {products.map((product) => (
          <Col md={4} key={product._id} className="mb-4">
            <Card>
              <Card.Img variant="top" src={product.imageUrl} />
              <Card.Body>
                <Card.Title>{product.name}</Card.Title>
                <Card.Text>{product.description}</Card.Text>
                <Card.Text>
                  <strong>Цена:</strong> {product.price} ₽
                </Card.Text>
                <div className="d-flex justify-content-between">
                  <Button 
                    variant="primary" 
                    onClick={() => navigate(`/product/${product._id}`)}
                  >
                    Подробнее
                  </Button>
                  <Button 
                    variant="success" 
                    onClick={() => addToCart(product)}
                  >
                    В корзину
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Catalog;
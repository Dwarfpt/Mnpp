// frontend/src/pages/Products.js
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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

    useEffect(() => {
        fetchProducts();
    }, []);

    if (loading) return (
        <Container className="mt-5 text-center">
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Загрузка...</span>
            </Spinner>
        </Container>
    );

    if (error) return (
        <Container className="mt-5">
            <Alert variant="danger">{error}</Alert>
        </Container>
    );

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
                                <Card.Text><strong>Цена:</strong> {product.price} ₽</Card.Text>
                                {/* Добавьте кнопку для просмотра деталей или добавления в корзину */}
                                <Button variant="primary">Подробнее</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default Products;

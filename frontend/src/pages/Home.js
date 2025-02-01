// frontend/src/pages/Home.js
import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const Home = () => {
    return (
        <Container className="mt-5">
            <Row>
                <Col>
                    <Card className="text-center">
                        <Card.Body>
                            <Card.Title>Добро пожаловать на наш сайт!</Card.Title>
                            <Card.Text>
                                Здесь вы можете зарегистрироваться, войти в личный кабинет и получить доступ к различным разделам.
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Home;

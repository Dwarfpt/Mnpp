// frontend/src/pages/Blog.js
import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const Blog = () => {
    return (
        <Container className="mt-5">
            <Row>
                <Col md={8} className="mx-auto">
                    <Card className="mb-3">
                        <Card.Body>
                            <Card.Title>Заголовок статьи</Card.Title>
                            <Card.Text>
                                Контент вашей статьи здесь. Вы можете добавить больше информации, изображений и других элементов.
                            </Card.Text>
                        </Card.Body>
                    </Card>
                    {/* Добавьте больше карточек статей по необходимости */}
                </Col>
            </Row>
        </Container>
    );
};

export default Blog;

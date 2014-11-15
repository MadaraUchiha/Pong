// Created by madara all rights reserved.

(function (canvas) {
    'use strict';
    var ctx = canvas.getContext('2d');
    var paddles = [];
    var ball;

    var entities = [];

    var HORIZONTAL = 0;
    var VERTICAL = Math.PI;

    function init() {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        paddles.push(new Paddle(new Vector(30, canvas.height / 2), 100, 15));
        paddles.push(new Paddle(Vector.reverse(30, canvas.height / 2), 100, 25));

        ball = new Ball(Vector.CENTER.add(new Vector(-10, 50)), 10);

        entities = entities.concat(paddles, ball);
        window.requestAnimationFrame(loop);
    }


    /**
     *
     * @param x
     * @param y
     * @constructor
     */
    function Vector(x, y) {
        this.x = x;
        this.y = y;
    }

    Vector.reverse = function (x, y) {
        return new Vector(canvas.width - x, canvas.height - y);
    };

    Vector.prototype.add = function (vector) {
        return new Vector(this.x + vector.x, this.y + vector.y);
    };

    Vector.prototype.multiply = function (scalar) {
        return new Vector(this.x * scalar, this.y * scalar);
    };

    Vector.prototype.inBounds = function () {
        return this.x >= 0 && this.x <= canvas.width && this.y >= 0 && this.y <= canvas.height;
    };

    Vector.CENTER = new Vector(canvas.width / 2, canvas.height / 2);


    /**
     * @abstract
     * @param centerPosition
     * @constructor
     */
    function Entity(centerPosition) {
        this.position = centerPosition;
    }

    Entity.prototype = {
        moveTo: function (newPosition) {
            if (this.canMoveTo(newPosition)) {
                this.position = newPosition;
            }
            this.draw();
        },
        draw: function () {
            throw new Error('draw should be implemented with extending objects');
        },
        canMoveTo: function () {
            throw new Error('canMoveTo should be implemented with extending objects');
        },
        overlaps: function (vector) {
            throw new Error('overlaps should be implemented with extending objects');
        }
    };


    /**
     *
     * @extends {Entity}
     * @param {Vector} centerPosition
     * @param {Number} width
     * @param {Number} movingSpeed
     * @param {function(Ball)=} moveLogic
     * @constructor
     */
    function Paddle(centerPosition, width, movingSpeed, moveLogic) {
        Entity.call(this, centerPosition);
        this.width = width;
        this.speed = movingSpeed;
        this.moveLogic = moveLogic || this.ai;
    }

    Paddle.prototype = Object.create(Entity.prototype);

    Paddle.prototype.thickness = 20;

    Paddle.prototype.draw = function () {
        var origin = this.getOriginVector();

        ctx.fillStyle = 'white';
        ctx.fillRect(origin.x, origin.y, this.thickness, this.width);
    };

    Paddle.prototype.getOriginVector = function () {
        var x = this.position.x - this.thickness / 2;
        var y = this.position.y - this.width / 2;
        return new Vector(x, y);
    };

    Paddle.prototype.canMoveTo = function (newPosition) {
        var newY = newPosition.y - (this.width / 2);
        return newY >= 0 && newY + this.width <= canvas.height;
    };

    Paddle.prototype.ai = function (ball) {
        var findMoveVector = function(ball) {
            var delta = ball.position.y - this.position.y,
                direction = delta / Math.abs(delta);

            if (Math.abs(delta) < this.width / 2) {
                direction = 0;
            }

            return new Vector(0, direction).multiply(this.speed);
        }.bind(this);

        return this.position.add(findMoveVector(ball));
    };
    Paddle.prototype.overlaps = function (vector) {
        /* jshint -W014 */
        var origin = this.getOriginVector();
        return vector.x >= origin.x
            && vector.x <= origin.x + this.thickness
            && vector.y >= origin.y
            && vector.y <= origin.y + this.width;
    };


    /**
     * @extends Entity
     * @param centerPosition
     * @param radius
     * @constructor
     */
    function Ball(centerPosition, radius) {
        Entity.call(this, centerPosition);
        this.radius = radius;
    }

    Ball.prototype = Object.create(Entity.prototype);
    Ball.prototype.draw = function () {
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y - this.radius, this.radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    };
    Ball.prototype.canMoveTo = function (newPosition) {
        return Object.keys(this.collidesWith(newPosition, paddles)).length === 0;
    };
    Ball.prototype.collidesWith = function (newPosition, entities) {
        var coordinates = {
            top: new Vector(newPosition.x, newPosition.y - this.radius),
            left: new Vector(newPosition.x - this.radius, newPosition.y),
            bottom: new Vector(newPosition.x, newPosition.y + this.radius),
            right: new Vector(newPosition.x + this.radius, newPosition.y)
        };

        return Object.keys(coordinates)
            .map(function getCollisions(direction) {
                var results = null;
                entities.forEach(function addCollision(entity) {
                    if (entity.overlaps(coordinates[direction])) {
                        results = entity;
                    }
                });
                if (!coordinates[direction].inBounds()) {
                    results = canvas;
                }
                return {direction: direction, results: results};
            }).filter(function removeEmpty(collisions) {
                return collisions.results !== null;
            }).reduce(function(obj, collisions) {
                obj[collisions.direction] = collisions.results;
                return obj;
            }, {});

    };
    Ball.prototype.moveLogic = function () {

        var newPosition = this.position.add(new Vector(this.speed * Math.cos(this.moveDirection), this.speed * Math.sin(this.moveDirection)));
        var collisions = this.collidesWith(newPosition, paddles);
        if (collisions.top || collisions.bottom) {
            this.moveDirection *= -1;
            return this.moveLogic();
        }
        if (collisions.left || collisions.right) {
            this.moveDirection = Math.PI - this.moveDirection;
            if (collisions.left === canvas || collisions.right === canvas) {
                return this.position; //GAME OVER!
            }
            return this.moveLogic();
        }
        return newPosition;
    };
    Ball.prototype.speed = 10;
    Ball.prototype.moveDirection = Math.PI / 4;


    function loop() {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        entities.forEach(function moveEntities(entity) {
            var newPosition = entity.moveLogic(ball);
            entity.moveTo(newPosition);
        });

        window.requestAnimationFrame(loop);
    }

    init();
})(document.getElementById('pong'));

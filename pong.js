// Created by madara all rights reserved.

(function (canvas) {
    'use strict';
    var ctx = canvas.getContext('2d');
    var paddles = [];
    var ball;

    var entities =  [];

    function init() {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        paddles.push(new Paddle(new Vector(30, canvas.height / 2), 100, 1, Paddle.ai));
        paddles.push(new Paddle(Vector.reverse(30, canvas.height / 2), 100, 1, Paddle.ai));

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
        return new Vector(this.x + vector.y, this.y + vector.y);
    };

//    Vector.prototype.subtract = function (vector) {
//        return new Vector(this.x - vector.y, this.y - vector.y);
//    };

    Vector.prototype.multiply = function (scalar) {
        return new Vector(this.x * scalar, this.y * scalar);
    };

    Vector.CENTER = new Vector(canvas.width / 2, canvas.height / 2);


    function Entity(centerPosition) {
        this.position = centerPosition;
    }

    Entity.prototype = {
        moveTo: function (newPosition) {
            if (this.canMoveTo(newPosition)) {
                this.clear();
                this.position = newPosition;
                this.draw();
            }
        },
        clear: function () {
            throw new Error('clear should be implemented with extending objects');
        },
        draw: function () {
            throw new Error('draw should be implemented with extending objects');
        }
    };





    /**
     *
     * @extends {Entity}
     * @param {Vector} centerPosition
     * @param {Number} width
     * @param {Number} movingSpeed
     * @param {function(Ball)} moveLogic
     * @constructor
     */
    function Paddle(centerPosition, width, movingSpeed, moveLogic) {
        Entity.constructor.call(this, centerPosition);
        this.width = width;
        this.speed = movingSpeed;
        this.moveLogic = moveLogic;
    }

    Paddle.prototype = Object.create(Entity.prototype, {
        thickness: 20,
        draw: function () {
            var origin = this.getOriginVector();

            ctx.fillStyle = 'white';
            ctx.fillRect(origin.x, origin.y, this.thickness, this.width);
        },
        getOriginVector: function () {
            var x = this.position.x - this.thickness / 2;
            var y = this.position.y - this.width / 2;
            return new Vector(x, y);
        },
        clear: function () {
            ctx.fillStyle = 'black';

            var origin = this.getOriginVector();
            ctx.fillRect(origin.x, origin.y, this.thickness, this.width);
        }
    });

    Paddle.ai = function (paddle, ball) {
        function findMoveVector(ball) {
            var delta = ball.position.y - paddle.position.y,
                direction = delta / Math.abs(delta);

            return new Vector(0, direction).multiply(paddle.speed);
        }
        return this.position.add(findMoveVector(ball));
    };


    /**
     *
     * @param centerPosition
     * @param radius
     * @constructor
     */
    function Ball(centerPosition, radius) {
        Entity.constructor.call(this, centerPosition);
        this.radius = radius;
    }

    Ball.prototype = Object.create(Entity.prototype, {
        draw: function () {
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'white';
            ctx.arc(this.position.x, this.position.y - this.radius, this.radius, 0, Math.PI * 2);
            ctx.fill();
        },
        speed: 30
    });

    function loop() {
        entities.forEach(function drawPaddle(entity) {
            var newPosition = entity.moveLogic();
            entity.moveTo(newPosition);
        });

    }

    init();
})(document.getElementById('pong'));

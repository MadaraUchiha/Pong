// Created by madara all rights reserved.

(function (canvas) {
    'use strict';
    var ctx = canvas.getContext('2d');
    var paddles = [];
    var ball;

    var entities = [];

    function init() {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        paddles.push(new Paddle(new Vector(30, canvas.height / 2), 100, 3));
        paddles.push(new Paddle(Vector.reverse(30, canvas.height / 2), 100, 2));

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

//    Vector.prototype.subtract = function (vector) {
//        return new Vector(this.x - vector.y, this.y - vector.y);
//    };

    Vector.prototype.multiply = function (scalar) {
        return new Vector(this.x * scalar, this.y * scalar);
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
                this.clear();
                this.position = newPosition;
                this.draw();
            }
        },
        clear: function () {
            this.draw('black');
        },
        draw: function (fill) {
            throw new Error('draw should be implemented with extending objects');
        },
        canMoveTo: function () {
            throw new Error('canMoveTo should be implemented with extending objects');
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

    Paddle.prototype.draw = function (fill) {
        var origin = this.getOriginVector();

        ctx.fillStyle = fill || 'white';
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

            return new Vector(0, direction).multiply(this.speed);
        }.bind(this);

        return this.position.add(findMoveVector(ball));
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
    Ball.prototype.draw = function (fill) {
        ctx.fillStyle = fill || 'white';
        ctx.arc(this.position.x, this.position.y - this.radius, this.radius, 0, Math.PI * 2);
        ctx.fill();
    };
    Ball.prototype.canMoveTo = function(newPosition) {
        var newTop = newPosition.y - this.radius;
        var newLeft = newPosition.x - this.radius;
        var newBottom = newPosition.y + this.radius;
        var newRight = newPosition.x + this.radius;

        return newTop >= 0 && newLeft >= 0 && newBottom <= canvas.height && newRight <= canvas.width;
    };
    Ball.prototype.moveLogic = function() {
        return this.position.add(new Vector(this.speed * Math.cos(this.moveDirection), this.speed * Math.sin(this.moveDirection)));
    };
    Ball.prototype.speed = 4;
    Ball.prototype.moveDirection = Math.PI / 4;


    function loop() {
        entities.forEach(function moveEntities(entity) {
            var newPosition = entity.moveLogic(ball);
            entity.moveTo(newPosition);
        });

        window.requestAnimationFrame(loop);
    }

    init();
})(document.getElementById('pong'));
